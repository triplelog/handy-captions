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


/*void Hello(const Nan::FunctionCallbackInfo<v8::Value>& info) {
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
}*/

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
std::vector<int> population;
std::vector<int> stationList;
std::vector<double> stationListLL;
int time1;
int time2;
int time3;
int geoRows;
int geoCols;
int startRow;
int startCol;
//std::map<int,int> landValueMap;


int ptDistance(int pt1, int pt2) {

	int x1 = pt1%geoCols;
	int y1 = pt1/geoCols;
	int x2 = pt2%geoCols;
	int y2 = pt2/geoCols;
	double dd = (x2-x1)*(x2-x1)+(y2-y1)*(y2-y1);
	double d = sqrt(dd)*3/1.4;//distance in km, approx i believe
	return d;
}

static double haversine(double lat1, double lon1, double lat2, double lon2) {
	// distance between latitudes
	// and longitudes
	double dLat = (lat2 - lat1) *
				  M_PI / 180.0;
	double dLon = (lon2 - lon1) *
				  M_PI / 180.0;

	// convert to radians
	lat1 = (lat1) * M_PI / 180.0;
	lat2 = (lat2) * M_PI / 180.0;

	// apply formulae
	double a = pow(sin(dLat / 2), 2) +
			   pow(sin(dLon / 2), 2) *
			   cos(lat1) * cos(lat2);
	if (a < 0){
		return 40000;
	}
	else if (a > 1){
		return 40000;
	}
	double rad = 6371;
	double c = 2 * asin(sqrt(a));
	return rad * c;
}

double yToLat(double y){
	double lat = -0.0083333333*(y+startRow) + 71.38708322329654;
	return lat;
}

double xToLng(double x){
	double lng = 0.0083333333*(x+startCol) - 179.14708263665557;
	return lng;
}

int radiusValue(int pt, int r) {
	int i; int ii;
	int total = 0;
	int rRC = r * 2;
	int x1 = pt%geoCols;
	int y1 = pt/geoCols;
	double lat1 = yToLat(y1);
	double lng1 = xToLng(x1);
	for (i=-1*rRC;i<=rRC;i++){
		for (ii=-1*rRC;ii<=rRC;ii++){
			
			int x = pt%geoCols + i;
			int y = pt/geoCols + ii;
			if (x < 0 || y < 0 || x >= geoCols || y >= geoRows){continue;}
			//if (y*geoCols + x < 0){continue;}
			//if (y*geoCols + x >= geoCols*geoRows){continue;}
			double lat2 = yToLat(y);
			double lng2 = xToLng(x);
			double dd3 = haversine(lat1,lng1,lat2,lng2);
			int d3 = round(pow(dd3,2));
			int div = 1;
			if (d3 > (r+1)*(r+1)){
				continue;
			}
			else if (d3 > (r-1)*(r-1)){
				div = 2;
			}
			
			total += population[y*geoCols + x]/div;
		}
	}
	return total;
}


std::map<int,std::vector<int> > radiusValueMap(int pt, int r, std::map<int,std::vector<int> > stationDMap, int sidx) {
	int i; int ii; int iii; int iiii;
	int rRC = r * 2;
	double lat1 = stationListLL[sidx*2+0];
	double lng1 = stationListLL[sidx*2+1];
	
	for (i=-1*rRC;i<=rRC;i++){
		for (ii=-1*rRC;ii<=rRC;ii++){
			
			int x = pt%geoCols + i;
			int y = pt/geoCols + ii;
			if (x < 0 || y < 0 || x >= geoCols || y >= geoRows){continue;}
			//if (y*geoCols + x < 0){continue;}
			//if (y*geoCols + x >= geoCols*geoRows){continue;}
			double lat2 = yToLat(y);
			double lng2 = xToLng(x);
			double dd3 = haversine(lat1,lng1,lat2,lng2);
			int d3 = round(pow(dd3,2));
			//int d2 = round(pow(haversine(lat1,lng1,lat2,lng2),2));
			//int d3 = i*i+ii*ii;
			int div = 1;
			if (d3 > (r+1)*(r+1)){
				continue;
			}
			else if (d3 > (r-1)*(r-1)){
				div = 2;
			}
			if (stationDMap.find(y*geoCols + x) != stationDMap.end()){
				int sz = stationDMap[y*geoCols + x].size()/3;
				for (iii=0;iii<sz;iii++){
					if (d3 < stationDMap[y*geoCols + x][iii*3+1]){
						stationDMap[y*geoCols + x].push_back(stationDMap[y*geoCols + x][(sz-1)*3]);
						stationDMap[y*geoCols + x].push_back(stationDMap[y*geoCols + x][(sz-1)*3+1]);
						stationDMap[y*geoCols + x].push_back(stationDMap[y*geoCols + x][(sz-1)*3+2]);
						for (iiii=iii+1;iiii<sz;iiii++){
							stationDMap[y*geoCols + x][iiii*3+0] = stationDMap[y*geoCols + x][(iiii-1)*3+0];
							stationDMap[y*geoCols + x][iiii*3+1] = stationDMap[y*geoCols + x][(iiii-1)*3+1];
							stationDMap[y*geoCols + x][iiii*3+2] = stationDMap[y*geoCols + x][(iiii-1)*3+2];
						}
						stationDMap[y*geoCols + x][iii*3+0] = sidx;
						stationDMap[y*geoCols + x][iii*3+1] = d3;
						stationDMap[y*geoCols + x][iii*3+2] = population[y*geoCols + x]/div;
						break;
					}
					if (iii==sz-1){
						stationDMap[y*geoCols + x].push_back(sidx);
						stationDMap[y*geoCols + x].push_back(d3);
						stationDMap[y*geoCols + x].push_back(population[y*geoCols + x]/div);
					}
				}
				
			}
			else {
				stationDMap[y*geoCols + x] = {sidx, d3,population[y*geoCols + x]/div};
			}
		}
	}
	return stationDMap;
}


double proftPerPassenger() {
	double rev = 1;
	double cost = 0;
	return std::max(1.0,std::min(50.0,rev-cost));
}

int ridership(std::vector<int> stations, std::map<int,std::vector<int> > stationDMap, std::map<int,int > firstPops) {
	int len = stations.size();
	int i; int ii; double riders = 0;
	std::vector<int> pops;
	std::vector<double> distance;
	double d = 0;
	std::map<int,int > idxToIdx;
	
	
    for (i=0;i<len;i++){
		pops.push_back(firstPops[stations[i]]);
		idxToIdx[stations[i]]=i;
	}
	unsigned long long now1 = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
    std::map<int, std::vector<int> >::iterator it;

	for (it = stationDMap.begin(); it != stationDMap.end(); it++){
		/*std::vector<int> its = it->second;
		int sz = its.size()/3;
		for (i=0;i<sz;i++){
			if (idxToIdx.find(its[i*3+0]) != idxToIdx.end()){
				pops[idxToIdx[its[i*3+0]]]+=its[i*3+2];
				break;
			}
		}*/
		if (idxToIdx.find(it->second[0]) == idxToIdx.end()){
			int sz = it->second.size()/3;
		
			for (i=1;i<sz;i++){
				if (idxToIdx.find(it->second[i*3+0]) != idxToIdx.end()){
					pops[idxToIdx[it->second[i*3+0]]]+=it->second[i*3+2];
					break;
				}
			}
		}
	}
    unsigned long long now2 = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
    
	for (i=0;i<len;i++){
		if (i==0){distance.push_back(0);}
		else {
			//double dd = ptDistance(stationList[stations[i]],stationList[stations[i-1]]);
			double dd = haversine(stationListLL[stations[i]*2+0],stationListLL[stations[i]*2+1],stationListLL[stations[i-1]*2+0],stationListLL[stations[i-1]*2+1]);
			d += dd;
			distance.push_back(d);
		}
	}
	unsigned long long now3 = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
    
	for (i=0;i<len;i++){
		for (ii=0;ii<len;ii++){
			if (ii == i){continue;}
			double dd = distance[ii] - distance[i];
			if (dd < 0){dd = -1*dd;}
			int di = dd;
			if (di < 500){ di = 500;}
			
			double n = pops[i]/2;
			n *= 15;
			n /= di;
			n /= di;
			n *= pops[ii];
			n /= 10000000;
			n *= pops[i];
			n /= (pops[i]+pops[ii]);
			//int n = 75000000*pops[i]/10000000*pops[ii]/10000000/500/500;//thousands of riders
			riders += n;
		}
	}
	unsigned long long now4 = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
    time1 += now2 - now1;
    time2 += now3 - now2;
    time3 += now4 - now3;
	int ret = riders;
	return ret;
}

std::vector<int> bestStations(std::vector<int> allStations, std::map<int,std::vector<int> > stationDMap, std::map<int,int > firstPops, int remove) {
	int len = allStations.size();
	int i; int ii; int iii;
	std::vector<int> maxRiders;
	std::vector<int> cut;
	for (i=0;i<remove;i++){
		maxRiders.push_back(0);
		cut.push_back(i);
	}
	
	for (i=0;i<len;i++){
		std::vector<int> stations;
		for (ii=0;ii<len;ii++){
			if (i != ii){
				stations.push_back(allStations[ii]);
			}
		}
		int riders = ridership(stations,stationDMap, firstPops);
		for (ii=0;ii<remove;ii++){
			if (riders > maxRiders[ii]){
				for (iii=ii+1;iii<remove;iii++){
					maxRiders[iii]=maxRiders[iii-1];
					cut[iii]=cut[iii-1];
				}
				maxRiders[ii] = riders;
				cut[ii] = i;
				break;
			}
		}
	}
	std::vector<int> stations;
	for (i=0;i<len;i++){
		for (ii=0;ii<remove;ii++){
			if (cut[ii] == i){
				break;
			}
			if (ii == remove - 1){
				stations.push_back(allStations[i]);
			}
		}
		
	}
	return stations;
}

void SetPopulation() {

	int row = 0;
	long totPop = 0;
	int i;
	std::ifstream file("maps/tocpp/pop.csv");
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
					
					population.push_back(rInt);
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
				population.push_back(rInt);
				totPop += rInt;
			}
			
			row++;
			//if (row > 100){
			//	break;
			//}
		}
		file.close();
	}

}

void SetLandValue() {

	
	int row = 0;
	long totPop = 0;
	int i;
	std::ifstream file("maps/tocpp/value.csv");
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

}

void GetLandValue(const Nan::FunctionCallbackInfo<v8::Value>& info) {
	v8::Isolate* isolate = info.GetIsolate();
	v8::Local<v8::Context> context = isolate->GetCurrentContext();
	
	int row = info[0]->Int32Value(context).FromJust();
	int col = info[1]->Int32Value(context).FromJust();
	
	int retInt = landValue[row*geoCols+col];
	

	

	//v8::String::Utf8Value s(isolate, info[0]);
	//std::string str(*s);
	
	
	//std::string out("hello world");
	//Nan::MaybeLocal<v8::String> h = Nan::New<v8::String>(out);
	//info.GetReturnValue().Set(h.ToLocalChecked());
	
	
	info.GetReturnValue().Set(retInt);
}

void GetPopulation(const Nan::FunctionCallbackInfo<v8::Value>& info) {
	v8::Isolate* isolate = info.GetIsolate();
	v8::Local<v8::Context> context = isolate->GetCurrentContext();
	
	int row = info[0]->Int32Value(context).FromJust();
	int col = info[1]->Int32Value(context).FromJust();
	
	int retInt = population[row*geoCols+col];
	
	int popRadius = radiusValue(row*geoCols+col, 20);

	

	//v8::String::Utf8Value s(isolate, info[0]);
	//std::string str(*s);
	
	
	//std::string out("hello world");
	//Nan::MaybeLocal<v8::String> h = Nan::New<v8::String>(out);
	//info.GetReturnValue().Set(h.ToLocalChecked());
	
	
	info.GetReturnValue().Set(popRadius);
}

void GetStations(const Nan::FunctionCallbackInfo<v8::Value>& info) {
	v8::Isolate* isolate = info.GetIsolate();
	v8::Local<v8::Context> context = isolate->GetCurrentContext();
	
	v8::Local<v8::Array> jsArr = v8::Local<v8::Array>::Cast(info[0]);
	
	int max = info[1]->Int32Value(context).FromJust();
	int r = info[2]->Int32Value(context).FromJust();
	
	int sz = jsArr->Length();
	int szz = -1;
	int i;
	std::vector<int> stations;
	std::map<int,std::vector<int> > stationDMap;
	std::map<int,int > idxToIdx;
	std::map<int,int > firstPops;

	for (i=0;i<sz;i++){
		szz = jsArr->Get(context,i).ToLocalChecked()->Int32Value(context).FromJust();
		stations.push_back(szz);
		stationDMap = radiusValueMap(stationList[stations[i]],r,stationDMap,stations[i]);
		firstPops[stations[i]]=0;
		idxToIdx[stations[i]]=i;
		//add ability to only recount people with multiple stations nearby
	}
	
	std::map<int, std::vector<int> >::iterator it;
	
	for (it = stationDMap.begin(); it != stationDMap.end(); it++){
		int sz2 = it->second.size()/3;
		firstPops[it->second[0]]+=it->second[2];
	}
	if (stations.size() > max){
		while (stations.size() > max + 20){
			stations = bestStations(stations,stationDMap,firstPops,4);
		}
		while (stations.size() > max + 10){
			stations = bestStations(stations,stationDMap,firstPops,3);
		}
		while (stations.size() > max + 5){
			stations = bestStations(stations,stationDMap,firstPops,2);
		}
		while (stations.size() > max){
			stations = bestStations(stations,stationDMap,firstPops,1);
		}
	}
	
	
	v8::Local<v8::Array> retArr = v8::Array::New(isolate,stations.size());
	
	v8::Local<v8::Number> xi0 = v8::Number::New(isolate,0);
	v8::Local<v8::Number> xxi0 = v8::Number::New(isolate,time1);
	retArr->Set(context,xi0,xxi0);
	v8::Local<v8::Number> xi1 = v8::Number::New(isolate,1);
	v8::Local<v8::Number> xxi1 = v8::Number::New(isolate,time2);
	retArr->Set(context,xi1,xxi1);
	v8::Local<v8::Number> xi2 = v8::Number::New(isolate,2);
	v8::Local<v8::Number> xxi2 = v8::Number::New(isolate,time3);
	retArr->Set(context,xi2,xxi2);	
		
	for (i=0;i<stations.size();i++){
		v8::Local<v8::Number> xi = v8::Number::New(isolate,i+3);
		v8::Local<v8::Number> xxi = v8::Number::New(isolate,stations[i]);
		retArr->Set(context,xi,xxi);
	}
	
	//int riders = ridership(stations,stationDMap);
	
	
	info.GetReturnValue().Set(retArr);
}

void Hello(const Nan::FunctionCallbackInfo<v8::Value>& info) {
	time1 = 0; time2 = 0; time3 = 0;
	geoRows = 5625-2643+1;
	geoCols = 13461-6534+1;
	startRow = 2643;
	startCol = 6534;
	SetLandValue();
	SetPopulation();
	stationList = {9641358, 5762952, 12842907, 7922993, 7977710, 10484045, 2681347, 10604943, 7168423, 11241295, 13236159, 16097689, 7515445, 14884255, 3796326, 16679284, 2072756, 11307150, 17255987, 4378106, 8020747, 12107658, 6856212, 2122838, 8228010, 11166637, 14143325, 8394984, 12279570, 5119243, 7356164, 15009918, 13929986, 5858902, 4394928, 5705140, 7736925, 8649677, 15086973, 4937118, 11371099, 14789217, 12847656, 4624991, 11623860, 7625517, 15412842, 9081179, 10092482, 14996441, 13154501, 8097273, 6340664, 16187500, 15869310, 5712555, 3786672, 11864605, 7154758, 8009111, 12614352, 4399686, 14066836, 10292670, 5222893, 10607104, 16437293, 4438259, 12284814, 11701877, 10208566, 7127604, 4899616, 2144663, 3983770, 7854332, 6553366, 11388011, 8471600, 16189014, 6405452, 13773961, 15182528, 5560537, 2974051, 12357670, 14012325, 4065986, 10660320, 15793185, 1400406, 4799073, 14412952, 14565336, 14018939, 3162832, 4444715, 7295461, 13705137, 8484452, 15772425, 9157056, 15966797, 12150456, 9427626, 11127552, 10192422, 12135695, 9216648, 3942225, 7382604, 9101534, 5208864, 8537234, 11992879, 9940219, 14176838, 8501026, 2293671, 11621892, 8656956, 8485773, 5096694, 15910466, 11103507, 5847451, 16486929, 8573419, 10025322, 499081, 13864137, 13729296, 18059685, 7936766, 4944554, 10302256, 16193947, 11436880, 7694459, 13417066, 7161949, 6047069, 6664120, 10854329, 7438282, 19263081, 4738358, 12408645, 6018857, 14143576, 11332483, 16028135, 12807902, 8083685, 14815370, 13037065, 6149100, 16353268, 8319633, 2067893, 5215335, 18592935, 10092843, 10673601, 7436139, 16389805, 11752632, 11990572, 4832172, 15542903, 6753730, 11060753, 16757145, 6615196, 11753170, 10544783, 4022644, 10057899, 11443185, 1933128, 19491728, 5879637, 7202395, 9468105, 4237364, 14137730, 6372925, 17366626, 16777795, 12956340, 4739715, 15168628, 10836038, 16589200, 14047822, 14422398, 2619451, 2550153, 12586858, 17089586, 6385335, 5299381, 5519114, 15751842, 15931393, 6544131, 11241813, 13124370, 4413328, 18175167, 8949779, 6414850, 15724482, 1489767, 7104562, 9010564, 16305152, 17974507, 19306556, 6385302, 3685897, 9199124, 11997608, 17692475, 7318325, 7754766, 6870934, 18225965, 5900003, 11893946, 7127182, 15536974, 14019055, 17747764, 5512578, 7820540, 10132501, 19867882, 12194067, 5284057, 6891180, 9068992, 12177066, 8712638, 8638073, 14192685, 12162524, 13223749, 12325801, 13778229, 5451499, 7758239, 9406120, 11886254, 5872933, 9353093, 3918095, 12745848, 10404774, 11027780, 7564185, 5250322, 13429772, 15840917, 1407257, 5902076, 7580799, 11138189, 5234876, 11055548, 6763255, 6497734, 8175625, 4781336, 15716731, 11111077, 5823942, 9734285, 6399478, 9681700, 18315764, 12066724, 6474481, 18925494, 6913355, 6809475, 6026686, 13167745, 5569289, 13026179, 10259242, 5283512, 7287232, 17955490, 6737476, 6898541, 6475236, 9477913, 13420419, 6684808, 14620262, 17110442, 9191193, 5325387, 16104831, 17519179, 7992843, 11968819, 18897796, 11012044, 8731669, 16111745, 1164204, 11632793, 8000810, 5153153, 11760999, 10971574, 8795735, 5597302, 5694346, 8545858, 7606010, 5395482, 6516711, 9817262, 19172960, 1787686, 6317650, 19256088, 15828715, 10489583, 6276234, 6758242, 14266409, 11844115, 9822645, 5582009, 11855975, 11552237, 18807941, 6094081, 9260482, 7137372, 10404738, 8525051, 8547047, 11263526, 6565976, 7432179, 8484701, 6322704, 5248909, 8920471, 7992607, 17810028, 15875282, 12814690, 11775936, 16381338, 19202819, 12672199, 3103991, 7805933, 5852226, 1489803, 13824643, 3675633, 8965219, 8038867, 13254819, 17339054, 19583876, 13866249, 19313683, 12918627, 13752982, 10025157, 3647901, 8367865, 9554003, 13877696, 9637145, 12817676, 3194050, 9637122, 16526423, 13755423, 19666993, 8004205, 19604649, 16249683, 13123132, 10933521, 13039320, 5853667, 6087224, 13150859, 7024127, 8769632, 8700362, 12637459, 7786087, 12949217, 6267345, 12776014, 7204255, 7162710};
	int sz = stationList.size();
	int i;
	stationListLL.resize(0);
	for (i=0;i<sz;i++){
		int x1 = stationList[i]%geoCols;
		int y1 = stationList[i]/geoCols;
		double lat1 = yToLat(y1);
		double lng1 = xToLng(x1);
		stationListLL.push_back(lat1);//latitude
		stationListLL.push_back(lng1);//longitude
	}
	
}

void Init(v8::Local<v8::Object> exports) {
  v8::Local<v8::Context> context = exports->CreationContext();
  exports->Set(context,
               Nan::New("hello").ToLocalChecked(),
               Nan::New<v8::FunctionTemplate>(Hello)
                   ->GetFunction(context)
                   .ToLocalChecked());
  exports->Set(context,
               Nan::New("getLandValue").ToLocalChecked(),
               Nan::New<v8::FunctionTemplate>(GetLandValue)
                   ->GetFunction(context)
                   .ToLocalChecked());
  exports->Set(context,
               Nan::New("getPopulation").ToLocalChecked(),
               Nan::New<v8::FunctionTemplate>(GetPopulation)
                   ->GetFunction(context)
                   .ToLocalChecked());
  exports->Set(context,
               Nan::New("getStations").ToLocalChecked(),
               Nan::New<v8::FunctionTemplate>(GetStations)
                   ->GetFunction(context)
                   .ToLocalChecked());
    
}

NODE_MODULE(binding, Init)


