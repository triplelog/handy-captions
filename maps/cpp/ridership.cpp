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
	//stationList = {12952955, 10095394, 5250423, 6026759, 6529888, 13881702, 4396196, 8487149, 9644140, 6765207, 11928210, 10676681, 7438285, 6232594, 8006515, 6324528, 6518591, 11106711, 7023251, 4739724, 8414197, 6269153, 5514168, 11374381, 6038649, 11141403, 7114210, 13743989, 13709093, 14222393, 13494803, 8548324, 10495466, 10786298, 12629768, 11999302, 11001225, 15873890, 15915058, 16116395, 16102335, 15547389, 16198621, 14022985, 19261646, 19268641, 17972685, 16357988, 14147407, 14687756, 15802924, 15234524, 14237007, 12650299, 12421498, 12095526, 16593988, 16386066, 16309858, 13870251, 17697581, 19873616, 19589528, 19208361, 18598301, 15479265, 10031931, 8230384, 7440428, 7322765, 6643865, 4626325, 4473953, 4238586, 2949646, 4418377, 4445997, 14679496, 14229074, 13280301, 12441929, 14180930, 13848727, 12725616, 12359987, 11625246, 11063945, 11868029, 5166630, 9116372, 10252958, 8798273, 10482275, 10211512, 8659454, 12283114, 11756562, 11327139, 10529983, 11659592, 10751466, 16442037, 15845489, 14771435, 17175445, 19178494, 18173681, 16192172, 15505908, 15173006, 14993186, 16634856, 14888551, 13080281, 16032761, 16954228, 17259068, 18409266, 17432184, 15359497, 14929764, 11229328, 13433648, 14417112, 15186910, 15091327, 15001182, 19672669, 18930956, 19312128, 18231225, 19319257, 18064897, 15797743, 14813407, 7925279, 8715152, 7841824, 7696679, 7384734, 9678537, 9013164, 7627717, 7385078, 6893168, 4439539, 3101944, 3545678, 5874627, 5583619, 3823119, 3324239, 3012136, 2346815, 1861574, 14091146, 13695928, 9684494, 8971323, 15935991, 16684098, 16968161, 17099633, 14569540, 12851364, 14819646, 13128158, 15541458, 15756388, 15776977, 7939056, 4023804, 2145281, 14970618, 10135425, 15014250, 14070896, 19497354, 14147658, 18813369, 18321050, 18903250, 6401324, 3663248, 634384, 14270527, 8527511, 11015222, 14023101, 15721267, 13828633, 17979695, 15879864, 11756024, 14624482, 18180413, 7994913, 2388762, 11555571, 16531193, 8923045, 16109479, 13759393, 5853914, 16254373, 19610307, 1535389, 14148188, 2200721, 13239979, 4757739, 3530928, 6101672, 3787764, 4654380, 5707052, 12588803, 6858190, 11804307, 15971405, 4668328, 4209859, 7170491, 8652173, 13434184, 3163744, 7204473, 14016369, 4224141, 8575893, 12166034, 4701741, 17752886};
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


