import fs from 'fs';

export default function ensurePathExists( path ) {
    try {
        if ( !fs.existsSync(path) ) { 
            console.log ( "Warning! Path does not exists. ");
            console.log ( "Creating.... " );
            fs.mkdirSync( path, { recursive: true } );
        } else {
            console.log ( "Path existed" );
            console.log ( "Skipping..." );
        }
    } catch (error) {
        console.log(error)
        return new Error(error.message)
    }
} 
