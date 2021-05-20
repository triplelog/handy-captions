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
#include <fstream>


/*
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
*/

std::vector<int> landValue;
//std::map<int,int> landValueMap;


void Hello(const Nan::FunctionCallbackInfo<v8::Value>& info) {
	//v8::Isolate* isolate = info.GetIsolate();
	//v8::Local<v8::Context> context = isolate->GetCurrentContext();
	
	//v8::Local<v8::Array> jsArr = v8::Local<v8::Array>::Cast(info[0]);
	
	//int sz = info[0]->Int32Value(context).FromJust();
	//int i;
	//int row = 0;
	//for (i=1;i<sz+1;i++){
	//	int row1 = info[i]->Int32Value(context).FromJust();
	//	row += row1;
	//}
	

	//v8::String::Utf8Value s(isolate, info[0]);
	//std::string str(*s);
	
	
	//std::string out("hello world");
	//Nan::MaybeLocal<v8::String> h = Nan::New<v8::String>(out);
	//info.GetReturnValue().Set(h.ToLocalChecked());
	
	
	//info.GetReturnValue().Set(row);
}

void SetLandValue(const Nan::FunctionCallbackInfo<v8::Value>& info) {
	v8::Isolate* isolate = info.GetIsolate();
	v8::Local<v8::Context> context = isolate->GetCurrentContext();
	
	//v8::Local<v8::Array> jsArr = v8::Local<v8::Array>::Cast(info[0]);
	
	int row = 0;
	long totPop = 0;
	int i;
	std::ifstream file("maps/usa_pop.csv");
	if (file.is_open()) {
		std::string line;
		while (std::getline(file, line)) {
			// using printf() in all tests for consistency
			//printf("%s", line.c_str());
			int len = line.length();
			
			
			int rInt = 0;
			int col = 0;
			bool isDecimal = false;
			for (i=0;i<len;i++){
				if (line[i] == ','){
					if (!isDecimal){
						rInt *= 10;
					}
					
					landValue.push_back(rInt);
					totPop += rInt;
					//if (rInt > 0){
					//	landValueMap[row*6298+col]=rInt;
					//}
					col++;
					isDecimal = false;
					rInt = 0;
				}
				else if (line[i] == '.' && i < len -1 && line[i+1] != ','){
					rInt *= 10;
					rInt += line[i+1] - '0';
					isDecimal = true;
				}
				else if (!isDecimal){
					rInt *= 10;
					rInt += line[i] - '0';
				}
			}
			if (len > 0 && line[len-1] != ','){
				if (!isDecimal){
					rInt *= 10;
				}
				
				//if (rInt > 0){
				//	landValueMap[row*6298+col]=rInt;
				//}
				col++;
				landValue.push_back(rInt);
				totPop += rInt;
			}
			
			row++;
			//if (row > 100){
			//	break;
			//}
		}
		file.close();
	}
	row = totPop;
	

	

	//v8::String::Utf8Value s(isolate, info[0]);
	//std::string str(*s);
	
	
	//std::string out("hello world");
	//Nan::MaybeLocal<v8::String> h = Nan::New<v8::String>(out);
	//info.GetReturnValue().Set(h.ToLocalChecked());
	
	
	info.GetReturnValue().Set(row);
}

void GetLandValue(const Nan::FunctionCallbackInfo<v8::Value>& info) {
	v8::Isolate* isolate = info.GetIsolate();
	v8::Local<v8::Context> context = isolate->GetCurrentContext();
	
	int row = info[0]->Int32Value(context).FromJust();
	int col = info[1]->Int32Value(context).FromJust();
	
	int retInt = landValue[row*3333+col];
	

	

	//v8::String::Utf8Value s(isolate, info[0]);
	//std::string str(*s);
	
	
	//std::string out("hello world");
	//Nan::MaybeLocal<v8::String> h = Nan::New<v8::String>(out);
	//info.GetReturnValue().Set(h.ToLocalChecked());
	
	
	info.GetReturnValue().Set(retInt);
}
void Init(v8::Local<v8::Object> exports) {
  v8::Local<v8::Context> context = exports->CreationContext();
  exports->Set(context,
               Nan::New("hello").ToLocalChecked(),
               Nan::New<v8::FunctionTemplate>(SetLandValue)
                   ->GetFunction(context)
                   .ToLocalChecked());
  exports->Set(context,
               Nan::New("getLandValue").ToLocalChecked(),
               Nan::New<v8::FunctionTemplate>(GetLandValue)
                   ->GetFunction(context)
                   .ToLocalChecked());
    
}

NODE_MODULE(binding, Init)


