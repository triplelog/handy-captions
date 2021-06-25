function solvePostfix(expstr,intstr,data={}){
	var intarr = intstr.split("_");
	var stack = [];
	for (var i=0;i<intarr.length;i++){
		if (intarr[i] == "rand"){
			intarr[i] = Math.random();
		}
		else if (intarr[i].match(/[a-z]/i)){
			intarr[i] = data[intarr[i]];
		}
		else {
			intarr[i] = parseFloat(intarr[i]);
		}
		stack.push(0);
	}
	var currentIndex = 0;
	var arrayIndex = 0;
	for (var i=0;i<expstr.length;i++){
		if (expstr[i] == '_') {
        	stack[currentIndex] = intarr[arrayIndex];
        	currentIndex++;
        	arrayIndex++;
        }
        else{ 
            switch (expstr[i]){
            	case '+': stack[currentIndex - 2] = stack[currentIndex - 2]+stack[currentIndex - 1]; break;
	            case '-': stack[currentIndex - 2] = stack[currentIndex - 2]-stack[currentIndex - 1]; break; 
	            case '*': stack[currentIndex - 2] = stack[currentIndex - 2]*stack[currentIndex - 1]; break; 
	            case '/': stack[currentIndex - 2] = stack[currentIndex - 2]/stack[currentIndex - 1]; break;
	            case '^': stack[currentIndex - 2] = stack[currentIndex - 2]^stack[currentIndex - 1]; break;
	            case 'X': stack[currentIndex - 2] = Math.max(stack[currentIndex - 2],stack[currentIndex - 1]); break;
	            case 'N': stack[currentIndex - 2] = Math.min(stack[currentIndex - 2],stack[currentIndex - 1]); break;
	            case 'R': stack[currentIndex - 1] = Math.round(stack[currentIndex - 1]); currentIndex++; break;
	            case 'F': stack[currentIndex - 1] = Math.floor(stack[currentIndex - 1]); currentIndex++; break;
	            case 'A': stack[currentIndex - 1] = Math.abs(stack[currentIndex - 1]); currentIndex++; break;
	            case 'L': stack[currentIndex - 1] = Math.log(stack[currentIndex - 1]); currentIndex++; break;
            }
            currentIndex--;
        }
        console.log(stack);
	}
	return stack[0];
}