let input1 = document.getElementById('1');
let input2 = document.getElementById('2');
let input3 = document.getElementById('3');
let input4 = document.getElementById('4');
let sectioncalc1 = document.getElementById('sectioncalc1');
let sectioncalc2 = document.getElementById('sectioncalc2');
let calcdiv1 = document.getElementById('calcdiv1');
let calcdiv2 = document.getElementById('calcdiv2');
let btn1 = document.getElementById('btn1');
let btn2 = document.getElementById('btn2');
let button1 = document.getElementById('button1');
let button2 = document.getElementById('button2');
let button3 = document.getElementById('button3');
let button4 = document.getElementById('button4');
let divcalc1 = document.getElementById('divcalc1');
let divcalc2 = document.getElementById('divcalc2');
let para1 = document.querySelector('.p1');
let para2 = document.querySelector('.p2');

calcdiv1.style.display = 'none';
calcdiv2.style.display = 'none';
button2.style.display = 'none';
button4.style.display = 'none';

button1.addEventListener('click', buttoncalc1);
button2.addEventListener('click', buttonback1);
button3.addEventListener('click', buttoncalc2);
button4.addEventListener('click', buttonback2);

function buttoncalc1() {
		divcalc1.style.display = 'none';
		para1.style.display = 'block';
		calcdiv1.style.display = 'block';
		button1.style.display = 'none';
		button2.style.display = 'block';
};
function buttonback1() {
		calcdiv1.style.display = 'none';
		para1.style.display = 'none';
		divcalc1.style.display = 'block';
		button1.style.display = 'block';
		button2.style.display = 'none';
		input1.value = '';
		input2.value = '';
		para1.textContent = '';
		sectioncalc1.appendChild(para1);
};

function buttoncalc2() {
		divcalc2.style.display = 'none';
		para2.style.display = 'block';
		calcdiv2.style.display = 'block';
		button3.style.display = 'none';
		button4.style.display = 'block';
};
function buttonback2() {
		calcdiv2.style.display = 'none';
		para2.style.display = 'none';
		divcalc2.style.display = 'block';
		button3.style.display = 'block';
		button4.style.display = 'none';
		input3.value = '';
		input4.value = '';
		para2.textContent = '';
		sectioncalc2.appendChild(para2);
};

btn1.addEventListener('click', btnf1);
btn2.addEventListener('click', btnf2);

function btnf1() {
	let value1 = input1.value;
	let value2 = input2.value;

	input3.style.borderBottom = '1px solid black';
	input4.style.borderBottom = '1px solid black';

	if (value1 < 501) {
		var v1 = (500 - value1)*0.3;
	}
	if (value1 > 500 && value1 < 650) {
		var v1 = (650 - value1)*0.5;
	}
	if (value1 > 649 && value1 < 750) {
		var v1 = 750 - value1;
	}
	if (value1 > 749 && value1 < 850) {
		var v1 = (850 - value1)*1.3;
	}
	if (value1 > 849 && value1 < 1001) {
		var v1 = (1000 - value1)*3;
	}

	if (value2 < 501) {
		var v2 = (value2 - 500)*0.3;
	}
	if (value2 > 500 && value2 < 650) {
		var v2 = (value2 - 500)*0.5;
	}
	if (value2 > 649 && value2 < 750) {
		var v2 = value2 - 650;
	}
	if (value2 > 749 && value2 < 850) {
		var v2 = (value2 - 750)*1.3;
	}
	if (value2 > 849 && value2 < 1001) {
		var v2 = (value2 - 850)*3;
	}

	if (value1 < 501 && value2 < 651) {
		para1.textContent = (v1 + v2).toFixed(1) + ' р';
		para1.style.border = 'none';
		sectioncalc1.appendChild(para1);
	}
	if (value1 < 501 && value2 < 751 && value2 > 649) {
		para1.textContent = (v1 + v2 + 75).toFixed(1) + ' р';
		para1.style.border = 'none';
		sectioncalc1.appendChild(para1);
	}
	if (value1 < 501 && value2 < 851 && value2 > 749) {
		para1.textContent = (v1 + v2 + 225).toFixed(1) + ' р';
		para1.style.border = 'none';
		sectioncalc1.appendChild(para1);
	}
	if (value1 < 501 && value2 < 1001 && value2 > 849) {
		para1.textContent = (v1 + v2 + 420).toFixed(1) + ' р';
		para1.style.border = 'none';
		sectioncalc1.appendChild(para1);
	}
	if (value1 > 500 && value1 < 651 && value2 < 749) {
		para1.textContent = (v1 + v2).toFixed(1) + ' р';
		para1.style.border = 'none';
		sectioncalc1.appendChild(para1);
	}
	if (value1 > 500 && value1 < 651 && value2 < 851 && value2 > 749) {
		para1.textContent = (v1 + v2 + 75).toFixed(1) +' р';
		para1.style.border = 'none';
		sectioncalc1.appendChild(para1);
	}
	if (value1 > 500 && value1 < 651 && value2 < 1001 && value2 > 849) {
		para1.textContent = (v1 + v2 + 225).toFixed(1) + ' р';
		para1.style.border = 'none';
		sectioncalc1.appendChild(para1);
	}
	if (value1 > 649 && value1 < 751 && value2 < 851 && value2 > 749) {
		para1.textContent = v1 + v2 + ' р';
		para1.style.border = 'none';
		sectioncalc1.appendChild(para1);
	}
	if (value1 > 649 && value1 < 751 && value2 < 1001 && value2 > 849) {
		para1.textContent = (v1 + v2 + 225).toFixed(1) +' р';
		para1.style.border = 'none';
		sectioncalc1.appendChild(para1);
	}
	if (value1 > 749 && value1 < 851 && value2 < 1001 && value2 > 849) {
		para1.textContent = (v1 + v2).toFixed(1) + ' р';
		para1.style.border = 'none';
		sectioncalc1.appendChild(para1);
	}
	if (value1 > 849 && value2 < 1001) {
		para1.textContent = ((value2 - value1)*3).toFixed(1) + ' р';
		para1.style.border = 'none';
		sectioncalc1.appendChild(para1);
	}
	error1();
}

function error1() {
	let value1 = input1.value;
	let value2 = input2.value;
	let vl = Math.sign(value2 - value1);

	if (value2 < 0) {
		para1.textContent = 'Введённое вами число во второй строке меньше 0.';
		para1.style.border = '5px solid #e51c23';
		sectioncalc1.appendChild(para1);
	}
	if (value2 > 1000) {
		para1.textContent = 'Введённое вами число в первой строке больше 1000.';
		para1.style.border = '5px solid #e51c23';
		sectioncalc1.appendChild(para1);
	}
	if (value1 < 0) {
		para1.textContent = 'Введённое вами число в первой строке меньше 0.';
		para1.style.border = '5px solid #e51c23';
		sectioncalc1.appendChild(para1);
	}
	if (value1 > 1000) {
		para1.textContent = 'Введённое вами число в первой строке больше 1000.';
		para1.style.border = '5px solid #e51c23';
		sectioncalc1.appendChild(para1);
	}
	if (vl != 1) {
		para1.textContent = 'Первое число больше второго.';
		para1.style.border = '5px solid #e51c23';
		sectioncalc1.appendChild(para1);
	}
	if (value1.length == 0) {
		input1.style.borderBottom = '1px solid #e51c23';
	} else {
		input1.style.borderBottom = '1px solid black';
	}
	if (value2.length == 0) {
		input2.style.borderBottom = '1px solid #e51c23';
	} else {
		input2.style.borderBottom = '1px solid black';
	}
}

function btnf2() {
	let value3 = input3.value;
	let value4 = input4.value;

	para2.textContent = ((value4 - value3)*0.45).toFixed(1) + ' р';
	para2.style.border = 'none';
	sectioncalc2.appendChild(para2);
	error2();
}

function error2() {
	let value3 = input3.value;
	let value4 = input4.value;
	let vle = Math.sign(value4 - value3);

	if (vle != 1) {
		para2.textContent = 'Первое число больше второго.'
		para2.style.border = '5px solid #e51c23';
		sectioncalc2.appendChild(para2);
	}
	if (value3.length == 0) {
		input3.style.borderBottom = '1px solid #e51c23';
	} else {
		input3.style.borderBottom = '1px solid black';
	}
	if (value4.length == 0) {
		input4.style.borderBottom = '1px solid #e51c23';
	} else {
		input4.style.borderBottom = '1px solid black';
	}
}