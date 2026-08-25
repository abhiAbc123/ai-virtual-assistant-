const testStr = 'data:audio/webm;codecs=opus;base64,GkXfo59ChoEBQveBAULygQRC84EIQoK';

const wrongRegex = testStr.replace(/^data:[^;]+;base64,/, '');
console.log('Wrong regex result starts with:', wrongRegex.substring(0, 30));

const correctWay = testStr.includes(',') ? testStr.split(',')[1] : testStr;
console.log('Correct way result starts with:', correctWay.substring(0, 30));
