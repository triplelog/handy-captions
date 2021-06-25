function solvePostfix(expstr,intstr,data={}){
	var intarr = intstr.split(",");
	var stack = [];
	for (var i=0;i<intarr.length;i++){
		if (intarr[i].match(/[a-z]/i)){
			intarr[i] = data[intarr[i]];
		}
		stack.push(0);
	}
	var currentIndex = 0;
	var arrayIndex = 0;
	for (var i=0;i<expstr.length;i++){
		if (expstr[i] == '#') {
        	stack[currentIndex] = intarr[arrayIndex];
        	currentIndex++;
        	arrayIndex++;
        }
        else{ 
            switch (expstr[i]){
            	case '+': stack[currentIndex - 2] = stack[currentIndex - 2]+stack[currentIndex - 1]; break;
	            case '-': stack[currentIndex - 1] = stack[currentIndex - 2]-stack[currentIndex - 1]; break; 
	            case '*': stack[currentIndex - 2] = stack[currentIndex - 2]*stack[currentIndex - 1]; break; 
	            case '/': stack[currentIndex - 1] = stack[currentIndex - 2]/stack[currentIndex - 1]; break;
	            case '^': stack[currentIndex - 2] = stack[currentIndex - 2]^stack[currentIndex - 1]; break;
            }
        }
	}
	return stack[0];
}