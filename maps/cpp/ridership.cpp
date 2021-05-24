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

int ridership(std::vector<int> stations, std::map<int,std::vector<int> >* stationDMap, const std::map<int,int > firstPops) {
	
	int len = stations.size();
	int i; int ii; double riders = 0;
	std::vector<int> pops;
	std::vector<double> distance;
	double d = 0;
	std::map<int,int > idxToIdx;

	//std::ofstream logfile;
	//logfile.open("logfile.txt");
    for (i=0;i<len;i++){
    	//logfile << firstPops[stations[i]] << " " << stationListLL[stations[i]*2+0] << " " << stationListLL[stations[i]*2+1] << "\n";
		int p = firstPops.at(stations[i]);
		pops.push_back(p);
		idxToIdx[stations[i]]=i;
	}
	//logfile.close();
	
	unsigned long long now1 = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();

    
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
	time1 += now2 - now1;
    
    
	int ret = riders;
	return ret;
}

std::vector<int> bestStations(std::vector<int> allStations, std::map<int,std::vector<int> >* stationDMap, const std::map<int,int > firstPops, int remove) {
	int len = allStations.size();
	int i; int ii; int iii;
	std::vector<int> maxRiders;
	std::vector<int> cut;
	std::map<int,int > idxToIdx;
	
    
	for (i=0;i<remove;i++){
		maxRiders.push_back(0);
		cut.push_back(i);
	}
	
	std::map<int,std::map<int,int> > pops;
	for (i=0;i<len;i++){
		idxToIdx[allStations[i]]=i;
		std::map<int,int> popRow;
    	for (ii=0;ii<len;ii++){
			int p = firstPops.at(allStations[ii]);
			popRow[allStations[ii]]=p;
		}
		pops[allStations[i]]=popRow;
	}
	std::map<int, std::vector<int> >::const_iterator it;
	int sz;
	unsigned long long now3 = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
	for (it = stationDMap->begin(); it != stationDMap->end(); it++){
		//unsigned long long now3 = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
    	
		if (it->second.size() > 5 && idxToIdx.find(it->second[0]) == idxToIdx.end()){
			ii = it->second[0];
			i = it->second[3];
			pops[ii][i]+=it->second[5];
			
		}
		
	}
	unsigned long long now4 = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
	time2 += now4 - now3;
	for (i=0;i<len;i++){
		
		std::vector<int> stations;
		for (ii=0;ii<len;ii++){
			if (i != ii){
				stations.push_back(allStations[ii]);
			}
		}
		
		
    	//unsigned long long now2 = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
    
		int riders = ridership(stations,stationDMap, pops[allStations[i]]);
		
		
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
	
	int popRadius = radiusValue(row*geoCols+col, 15);

	

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
	std::map<int,int > firstPops;
	
	unsigned long long now2 = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();

	for (i=0;i<sz;i++){
		szz = jsArr->Get(context,i).ToLocalChecked()->Int32Value(context).FromJust();
		stations.push_back(szz);
		stationDMap = radiusValueMap(stationList[stations[i]],r,stationDMap,stations[i]);
		firstPops[stations[i]]=0;
		//add ability to only recount people with multiple stations nearby
	}
	
	std::map<int, std::vector<int> >::iterator it;
	
	for (it = stationDMap.begin(); it != stationDMap.end(); it++){
		firstPops[it->second[0]]+=it->second[2];
	}
	unsigned long long now3 = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
    time3 += now3 - now2;
    
    std::map<int,std::vector<int> > * stationDMapPointer = new std::map<int,std::vector<int> >();
    
    for (it = stationDMap.begin(); it != stationDMap.end(); it++){
		(*stationDMapPointer)[it->first] = it->second;
	}
	unsigned long long now4 = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
    time1 += now4 - now3;
	
	if (stations.size() > max){
		while (stations.size() > max + 20){
			stations = bestStations(stations,stationDMapPointer,firstPops,4);
			std::map<int,int > idxToIdx;
			int sz2 = stations.size();
			for (i=0;i<sz2;i++){
				idxToIdx[stations[i]]=i;
			}
			for (it = stationDMapPointer->begin(); it != stationDMapPointer->end(); ){
				while (it->second.size() > 0 && idxToIdx.find(it->second[0]) == idxToIdx.end()){
					it->second.erase(it->second.begin(),it->second.begin()+3);
					firstPops[it->second[0]]+=it->second[2];
				}
				if (it->second.size() < 3){
					it = stationDMapPointer->erase(it);
				}
				else {
					++it;
				}
			}
		}
		while (stations.size() > max + 10){
			stations = bestStations(stations,stationDMapPointer,firstPops,3);
			std::map<int,int > idxToIdx;
			int sz2 = stations.size();
			for (i=0;i<sz2;i++){
				idxToIdx[stations[i]]=i;
			}
			for (it = stationDMapPointer->begin(); it != stationDMapPointer->end(); ){
				while (it->second.size() > 0 && idxToIdx.find(it->second[0]) == idxToIdx.end()){
					it->second.erase(it->second.begin(),it->second.begin()+3);
					firstPops[it->second[0]]+=it->second[2];
				}
				if (it->second.size() < 3){
					it = stationDMapPointer->erase(it);
				}
				else {
					++it;
				}
			}
		}
		while (stations.size() > max + 5){
			stations = bestStations(stations,stationDMapPointer,firstPops,2);
			std::map<int,int > idxToIdx;
			int sz2 = stations.size();
			for (i=0;i<sz2;i++){
				idxToIdx[stations[i]]=i;
			}
			for (it = stationDMapPointer->begin(); it != stationDMapPointer->end(); ){
				while (it->second.size() > 0 && idxToIdx.find(it->second[0]) == idxToIdx.end()){
					it->second.erase(it->second.begin(),it->second.begin()+3);
					firstPops[it->second[0]]+=it->second[2];
				}
				if (it->second.size() < 3){
					it = stationDMapPointer->erase(it);
				}
				else {
					++it;
				}
			}
		}
		while (stations.size() > max){
			stations = bestStations(stations,stationDMapPointer,firstPops,1);
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
	stationList = {11127552, 8228010, 16437293, 9081179, 14884255, 4624991, 2072756, 15086973, 7625517, 16187500, 15412842, 14996441, 3786672, 13929986, 7854332, 11371099, 12279570, 8097273, 4394928, 12847656, 11864605, 8649677, 12614352, 2122838, 14789217, 5705140, 9157056, 10208566, 12284814, 8009111, 7161949, 12357670, 15772425, 15793185, 8471600, 13773961, 10660320, 15869310, 14018939, 10292670, 7127604, 6340664, 5712555, 5215335, 16189014, 10607104, 14066836, 12135695, 9101534, 4065986, 2144663, 1400406, 4399686, 9427626, 13705137, 16353268, 4899616, 14012325, 15182528, 4944554, 6405452, 5208864, 8485773, 16193947, 3162832, 7295461, 2974051, 4444715, 5096694, 18059685, 15966797, 12150456, 9940219, 11621892, 14565336, 10854329, 6664120, 8537234, 8484452, 14412952, 15910466, 8083685, 8319633, 5847451, 16028135, 13729296, 11332483, 2293671, 11753170, 499081, 8501026, 7382604, 9216648, 10192422, 14176838, 13864137, 14143576, 13037065, 8656956, 4738358, 11992879, 7936766, 10302256, 10025322, 16486929, 11436880, 19263081, 16589200, 6047069, 7694459, 8573419, 16305152, 8949779, 17089586, 12807902, 13417066, 10092843, 18592935, 11990572, 12408645, 18225965, 5519114, 7438282, 6385335, 8712638, 6414850, 6372925, 12956340, 6018857, 7436139, 11443185, 14815370, 16777795, 1489767, 11060753, 10673601, 6615196, 4739715, 7202395, 6753730, 6149100, 19867882, 10544783, 17366626, 7754766, 11997608, 2550153, 17747764, 8638073, 2067893, 14137730, 5299381, 16389805, 15542903, 9010564, 16757145, 9468105, 11752632, 5879637, 4832172, 10057899, 15536974, 9199124, 4022644, 1933128, 11241813, 7318325, 19491728, 15751842, 15840917, 4237364, 19306556, 15168628, 6870934, 10836038, 12586858, 14422398, 15931393, 2619451, 5451499, 6385302, 11893946, 9353093, 14047822, 12194067, 5900003, 7127182, 6544131, 15724482, 14192685, 4413328, 17692475, 17974507, 3918095, 5872933, 3685897, 10404774, 13124370, 7820540, 12177066, 14019055, 13429772, 5283512, 13223749, 10132501, 18175167, 13778229, 7104562, 5284057, 6497734, 12162524, 7758239, 9068992, 10259242, 5512578, 5823942, 12745848, 11886254, 6891180, 13026179, 17110442, 11138189, 9406120, 12325801, 11968819, 6763255, 11027780, 7564185, 5902076, 11111077, 6913355, 6475236, 5250322, 13167745, 12066724, 7580799, 11055548, 1407257, 5569289, 14620262, 18315764, 5234876, 6737476, 9191193, 6809475, 5694346, 8545858, 8795735, 15716731, 9734285, 11760999, 4781336, 6474481, 18925494, 13420419, 6684808, 8175625, 8000810, 17955490, 5597302, 9817262, 6898541, 9681700, 17519179, 9477913, 16104831, 6399478, 6026686, 1164204, 18897796, 7992843, 10971574, 5582009, 7287232, 6516711, 19172960, 5325387, 11012044, 7606010, 6094081, 16111745, 1787686, 15828715, 11844115, 5395482, 6317650, 8731669, 5153153, 11552237, 18807941, 8525051, 9822645, 7137372, 11632793, 19256088, 6276234, 12814690, 8547047, 9260482, 17810028, 8484701, 6322704, 14266409, 10404738, 6758242, 7992607, 11263526, 10489583, 6565976, 8920471, 11855975, 16381338, 19202819, 7432179, 5852226, 11775936, 3103991, 15875282, 12672199, 5248909, 13866249, 3675633, 13254819, 9637145, 13824643, 1489803, 19583876, 8038867, 19313683, 12918627, 17339054, 9554003, 7805933, 12817676, 8965219, 13752982, 13755423, 3647901, 16249683, 3194050, 8367865, 9637122, 16526423, 19666993, 7024127, 10025157, 13877696, 8004205, 19604649, 13039320, 6087224, 13123132, 12637459, 13150859, 12949217, 8769632, 5853667, 10933521, 8700362, 7786087, 7204255, 6267345, 12776014, 7162710};
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


