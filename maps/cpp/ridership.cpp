#include <nan.h>
#include <stdio.h>
#include <stdlib.h>
#include <algorithm>
#include <math.h>
#include <limits.h>
#include <time.h>
#include <string.h> 
#include <ctype.h>
#include <cmath>
#include <iostream>
#include <variant>
#include <map>
#include <numeric>
#include <chrono>
#include <thread>
#include <sstream>
#include <iostream>
#include <array>
#include <vector>



unsigned int now; unsigned int start;
std::vector<int> landValue;

int radiusValue(int pt) {
	int r = 80;
	int i; int ii;
	int total = 0;
	for (i=-1*r;i<=r;i++){
		for (ii=-1*r;ii<=r;ii++){
			int x = pt%1000 + i;
			int y = pt/1000 + ii;
			total += landValue[y*1000 + x];
		}
	}
	return total;
}


int main(int argc, char *argv[]) {
	start = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();

	srand (time(NULL));
	int i; int ii;
	for (i=0;i<1000*1000;i++){
		landValue.push_back(rand() % 1000);
	}
	
	now = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
	std::cout << start << " and " << now << "\n";
	
	std::vector<int> path;
	for (i=0;i<1000;i++){
		path.push_back( (rand() % 800 + 80) * 1000 + (rand() % 800 + 80) );
	}
	
	now = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
	std::cout << start << " and " << now << "\n";
	
	int totalValue = 0;
	for (auto ii = path.begin(); ii != path.end(); ii++){
		//totalValue += landValue[*ii];
		totalValue = radiusValue(*ii);
	}
	
	now = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
	std::cout << totalValue << " and " << now << "\n";
	
	//totalValue = radiusValue(path[0]);
	
	now = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
	std::cout << totalValue << " and " << now << "\n";
	
	return 1;
}

