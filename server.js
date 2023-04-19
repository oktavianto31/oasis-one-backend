import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import {
	userJoin,
	getCurrentUser,
	userLeave,
	getRoomUsers,
} from './utils/users.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes
import management from './routes/management.js';
import tenant from './routes/tenant.js';
import user from './routes/user.js';
import order from './routes/order.js';
import promo from './routes/promo.js';
import menu from './routes/menu.js';
import table from './routes/table.js';
import waiter from './routes/waiter.js';
import images from './routes/images.js';
import contract from './routes/contract.js';
import foodcourt from './routes/foodcourt.js';
import webtracking from './routes/webtracking.js';
import payment from './routes/payment.js';

dotenv.config();

import { runBot } from './controllers/Notification/telegram.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
		credentials: false,
	},
});

const port = process.env.PORT || 5000;
app.use(
	cors({
		origin: '*',
		credentials: true,
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uri = process.env.MONGODB_URI;
mongoose.connect(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once('open', () => {
	console.log('Database connected successfully');
});

runBot();

app.use('/api/management', management);
app.use('/api/tenant', tenant);
app.use('/api/user', user);
app.use('/api/order', order);
app.use('/api/promo', promo);
app.use('/api/menu', menu);
app.use('/api/table', table);
app.use('/api/waiter', waiter);
app.use('/api/images', images);
app.use('/api/contract', contract);
app.use('/api/foodcourt', foodcourt);
app.use('/api/tracking', webtracking);
app.use('/api/payment', payment);

let online = 0;

// Run when client connects
io.on('connection', (socket) => {
	online++;
	const tenantID = socket.handshake.query.tenant_id;
	console.log(tenantID + ' client is connected with ' + socket.id);
	console.log(`Online: ${online}`);
	io.emit('visitor enters', online);

	socket.on('connect_error', (err) => {
		console.log(`connect_error due to ${err.message}`);
	});

	socket.on('joinRoom', (room) => {
		const user = userJoin(socket.id, room);
		// console.log( 'socket ID', socket.id );
		// console.log( 'room', room );
		// console.log( 'user', user );

		socket.join(user.room);

		// Send users and room info
		io.to(user.room).emit('roomUsers', {
			room: user.room,
			users: getRoomUsers(user.room),
		});
	});

	// Listen for events
	socket.on('add table', (data) => {
		const user = getCurrentUser(socket.id);
		console.log('user room (add table)', user.room);
		io.to(user.room).emit('add table', data);
	});
	socket.on('delete table', (data) => {
		const user = getCurrentUser(socket.id);
		console.log('user room (delete table)', user.room);
		io.to(user.room).emit('delete table', data);
	});
	socket.on('remove table', (data) => {
		const user = getCurrentUser(socket.id);
		console.log('user room (remove table)', user.room);
		io.to(user.room).emit('remove table', data);
	});
	socket.on('duplicate table', (data) => {
		const user = getCurrentUser(socket.id);
		console.log('user room (duplicate table)', user.room);
		io.to(user.room).emit('duplicate table', data);
	});
	socket.on('add waiter call', (data) => {
		const user = getCurrentUser(socket.id);
		console.log('user room (add call waiter)', user.room);
		io.to(user.room).emit('add waiter call', data);
	});
	socket.on('remove waiter call', (data) => {
		const user = getCurrentUser(socket.id);
		console.log('user room (remove call waiter)', user.room);
		io.to(user.room).emit('remove waiter call', data);
	});
	socket.on('update user', (data) => {
		const user = getCurrentUser(socket.id);
		console.log('user room (update user)', user.room);
		io.to(user.room).emit('update user', data);
	});

	socket.on('add promo', (data) => {
		const user = getCurrentUser(socket.id);
		console.log('user room (add promo)', user.room);
		io.to(user.room).emit('add promo', data);
	});
	socket.on('update promo', (data) => {
		const user = getCurrentUser(socket.id);
		console.log('user room (update promo)', user.room);
		io.to(user.room).emit('update promo', data);
	});
	socket.on('delete promo', (data) => {
		const user = getCurrentUser(socket.id);
		console.log('user room (delete promo)', user.room);
		io.to(user.room).emit('delete promo', data);
	});

	socket.on('add category', (data) => {
		const user = getCurrentUser(socket.id);
		console.log('user room (add category)', user.room);
		io.to(user.room).emit('add category', data);
	});
	socket.on('update category', (data) => {
		const user = getCurrentUser(socket.id);
		console.log('user room (update category)', user.room);
		io.to(user.room).emit('update category', data);
	});
	socket.on('delete category', (data) => {
		const user = getCurrentUser(socket.id);
		console.log('user room (delete category)', user.room);
		io.to(user.room).emit('delete category', data);
	});

	socket.on('add order', (data) => {
		console.log('data (add order)', data);
		const user = getCurrentUser(socket.id);
		console.log('user room (add order)', user);
		io.to(data.tenant_id).emit('add order', data);
	});
	socket.on('update order', (data) => {
		const user = getCurrentUser(socket.id);
		console.log('user room (update order)', user.room);
		io.to(user.room).emit('update order', data);
	});

	// Runs when client disconnects
	socket.on('disconnect', () => {
		const user = userLeave(socket.id);
		online--;
		console.log(`Socket ${socket.id} disconnected.`);
		console.log(`Online: ${online}`);
		io.emit('visitor exits', online);
		if (user) {
			// Send users and room info
			io.to(user.room).emit('roomUsers', {
				room: user.room,
				users: getRoomUsers(user.room),
			});
		}
	});
});

httpServer.listen(port, () => {
	console.log('Server and socket is running on port:', port);
});
