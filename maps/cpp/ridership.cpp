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
	double lat = -0.02499999989999999*(y+startRow) + 71.38708322329654;
	return lat;
}

double xToLng(double x){
	double lng = 0.0249999999*(x+startCol) - 179.14708263665557;
	return lng;
}

int radiusValue(int pt, int r) {
	int i; int ii;
	int total = 0;
	for (i=-1*r;i<=r;i++){
		for (ii=-1*r;ii<=r;ii++){
			int div = 1;
			if (i*i+ii*ii > (r+1)*(r+1)){
				continue;
			}
			else if (i*i+ii*ii > (r-1)*(r-1)){
				div = 2;
			}
			int x = pt%geoCols + i;
			int y = pt/geoCols + ii;
			if (y*geoCols + x < 0){continue;}
			if (y*geoCols + x >= geoCols*geoRows){continue;}
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
			int d2 = round(pow(dd3,2));
			//int d2 = round(pow(haversine(lat1,lng1,lat2,lng2),2));
			int d3 = i*i+ii*ii;
			int div = 1;
			if (d2 > (r+1)*(r+1)){
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



int ridership(std::vector<int> stations, std::map<int,std::vector<int> > stationDMap) {
	int len = stations.size();
	int i; int ii; long riders = 0;
	std::vector<int> pops;
	std::vector<double> distance;
	double d = 0;
	std::map<int,int > idxToIdx;
	
	
    for (i=0;i<len;i++){
		pops.push_back(0);
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
		
		int sz = it->second.size()/3;
		for (i=0;i<sz;i++){
			if (idxToIdx.find(it->second[i*3+0]) != idxToIdx.end()){
				pops[idxToIdx[it->second[i*3+0]]]+=it->second[i*3+2];
				break;
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
			
			long n = pops[i]/2;
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

std::vector<int> bestStations(std::vector<int> allStations, std::map<int,std::vector<int> > stationDMap, int remove) {
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
		int riders = ridership(stations,stationDMap);
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
	
	int popRadius = radiusValue(row*geoCols+col, 7);

	

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
	
	int sz = jsArr->Length();
	int szz = -1;
	int i;
	std::vector<int> stations;
	std::map<int,std::vector<int> > stationDMap;

	for (i=0;i<sz;i++){
		szz = jsArr->Get(context,i).ToLocalChecked()->Int32Value(context).FromJust();
		//szz = jsArr->Get(context,i);
		stations.push_back(szz);
		stationDMap = radiusValueMap(stationList[stations[i]],50,stationDMap,stations[i]);
	}
	while (stations.size() > max + 20){
		stations = bestStations(stations,stationDMap,5);
	}
	while (stations.size() > max + 10){
		stations = bestStations(stations,stationDMap,3);
	}
	while (stations.size() > max + 5){
		stations = bestStations(stations,stationDMap,2);
	}
	while (stations.size() > max){
		stations = bestStations(stations,stationDMap,1);
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
	geoRows = 995;
	geoCols = 2310;
	startRow = 2643/3;
	startCol = 6534/3;
	SetLandValue();
	SetPopulation();
	stationList = {1472696, 1345901, 861079, 231428, 916251, 796327, 1654930, 236577, 1669110, 488269, 1293158, 1366261, 849342, 1011303, 514158, 1678632, 421748, 634072, 900380, 1666926, 1264320, 1428628, 889464, 1713367, 1644032, 1828569, 1135417, 1403967, 155087, 1365700, 1018123, 794203, 636544, 1144980, 239234, 942031, 1564869, 452509, 489855, 1013470, 1531896, 1754722, 545667, 1558138, 579479, 330976, 1558243, 1048279, 352341, 495629, 810902, 1350931, 1601734, 1775642, 950056, 551410, 944007, 944447, 1292502, 1024133, 254268, 1106002, 1132345, 55528, 567488, 821478, 1768409, 649183, 1541173, 1113589, 944913, 1207514, 1576137, 926011, 962255, 1333040, 1526243, 674161, 741304, 528858, 1260684, 900469, 952881, 856160, 1272393, 883822, 1379269, 1491436, 1571976, 1819033, 1424613, 1782234, 828493, 1450202, 669374, 1334581, 713630, 1648132, 685081, 229806, 708891, 1186524, 736541, 527001, 800661, 1272186, 537039, 1821975, 1306065, 1230142, 1171292, 1729013, 1439457, 1119830, 447298, 655294, 1052536, 1572337, 1900533, 1863607, 1930536, 1865872, 472692, 291282, 2167868, 1687379, 1203725, 1399420, 1727036, 1604883, 1563149, 1251242, 1752479, 489784, 710708, 657465, 729016, 1770767, 1323153, 764062, 1022909, 408937, 2147706, 813906, 1458523, 1747977, 1999242, 2019948, 791141, 2027645, 870479, 1967574, 1579110, 588380, 1558177, 653059, 1355183, 613756, 1126225, 1007240, 588199, 1356232, 766193, 1470868, 863566, 1352645, 1533318, 722786, 157371, 719905, 1417782, 435538, 1322898, 1761390, 648274, 1226077, 1370126, 842752, 1045728, 658156, 1493363, 1239791, 584062, 531639, 768966, 583532, 1230716, 751259, 1235371, 843672, 757430, 621115, 1341492, 635093, 1448883, 1747702, 719653, 1624657, 1081228, 908025, 1463745, 1077555, 713125, 2036797, 743582, 768647, 978498, 671985, 891316, 810468, 623525, 1997521, 1492554, 1902867, 198747, 592921, 888660, 950621, 1053496, 129460, 1949062, 620736, 2101503, 1225451, 847458, 574763, 1308854, 1791632, 724494, 1221197, 704321, 970996, 678286, 1090415, 600123, 1293827, 1759631, 1318088, 1092210, 1285447, 751897, 699751, 2140119, 1029508, 1166747, 792841, 948304, 1585212, 731680, 703696, 2092333, 1317422, 1156937, 944090, 1253862, 888581, 826458, 1424566, 1981359, 992368, 583591, 166414, 650775, 1309215, 1765918, 1821462, 894766, 867918, 1409396, 1537244, 2136217, 995739, 1541877, 1474298, 405508, 1436122, 1062697, 1928273, 355821, 1425562, 930543, 1113534, 2147772, 1071931, 1530334, 1543384, 1837498, 890138, 1807594, 782801, 1448645, 2180109, 1462735, 678310, 651255, 1215439, 1439392, 967487, 865921, 801281, 696788, 1420911, 796669};
	int sz = stationList.size();
	int i;
	stationListLL.resize(0);
	for (i=0;i<sz;i++){
		int x1 = stationList[i]%geoCols;
		int y1 = stationList[i]/geoCols;
		int lat1 = yToLat(y1);
		int lng1 = xToLng(x1);
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


