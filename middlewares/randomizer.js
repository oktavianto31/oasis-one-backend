function generateRandomNumber(length) {
	var i = 0;
	var randomizer ='';
	for (i; i < length; i++) {
		const randNumber = Math.floor(Math.random()*10);
		randomizer += randNumber.toString();
	}
	return randomizer;
}

export { generateRandomNumber };
