import _ from 'lodash'

const random = (high,low) => {return Math.round(Math.random()*(high-low+1) + low);}
	
const mergeDefaultPropertyObject = (p,d,o)=>{
	for(var prop in d){
		if(typeof p == 'object'){
			if(typeof p[prop] === 'function') o[prop] = p[prop]
			else if(typeof p[prop] != 'undefined') o[prop] = _.cloneDeep(p[prop]);
			else o[prop] = _.cloneDeep(d[prop]);
		}
		else{
			o[prop] = _.cloneDeep(d[prop]);
		}
	}
}

//<---------------------GEOMETRIC FUNCTION-------------------->

const findQuadrant = (angle) => {
	if(angle < 90 && angle > 0) return 1;
	if(angle > 90 && angle < 180) return 2;
	if(angle > 180 && angle < 270) return 3;
	if(angle > 270 && angle < 360) return 4;
}

const findDistance2Point = (x1,y1,x2,y2)=>Math.sqrt(Math.pow((x1-x2),2) + Math.pow((y1-y2),2))


const findAngle2Point = function(x1,y1,x2,y2){
	//CHECK SPECIAL CASES
	if(x1===x2&&y1===y2) return 0;
	if(x1===x2){
		if(y1 < y2) return 270;
		if(y1 > y2) return 90;
	} 
	if(y1===y2){
		if(x1<x2) return 0;
		if(x2<x1) return 180;
	}

	//FIND QUADRANT
	var dx = x2-x1; var dy = y2-y1;
	var tan = Math.atan((-dy)/dx);

	if(x1<x2&&y1>y2) return radToDeg(tan);//QUADRANT 1
	if(x1>x2&&y1>y2) return	180 + radToDeg(tan); //QUADRANT 2
	if(x1>x2&&y1<y2) return 180 + radToDeg(tan);//QUADRANT 3
	if(x1<x2&&y1<y2) return 360 + radToDeg(tan);//QUADRANT 4
}

const radToDeg = (rad) => (rad*180)/Math.PI;

const degToRad = (deg) => (deg*Math.PI)/180;

const rotatePoint = (cx,cy,x,y,deg) => (deg===0||deg===360)? [x,y]: calculateRotatePoint(cx,cy,findAngle2Point(cx,cy,x,y)+deg,findDistance2Point(cx,cy,x,y));

const calculateRotatePoint = function(cx,cy,r,d){
	const rad = degToRad(r);

	//IF IT'S IN SPECIAL CASE
	const angleIndex = [0,90,180,270,360];
	const coeffIndex = [[1,0],[0,1],[-1,0],[0,-1],[1,0]];
	if(angleIndex.indexOf(r) !== -1){
		const coeff = coeffIndex[angleIndex.indexOf(r)];
		return [cx+coeff[0]*d,cy-coeff[1]*d];
	}
	return [cx + Math.cos(rad)*d, cy - Math.sin(rad)*d];
}


//<----------------------SEGMENT INTERSECTION, USED FOR OBJECT COLLISION------------------------------>
let findIntersection = function(s1,s2){
	//FIND CONSTRAINS FOR USE BEFORE INTERSECTION FUNCTION
	let [x11,y11,x12,y12] = s1
	let [x21,y21,x22,y22] = s2
	if(Math.round(x11) === Math.round(x12) || Math.round(x21) === Math.round(x22)){
		[x11,y11] = rotatePoint(0,0,x11,y11,30);
		[x12,y12] = rotatePoint(0,0,x12,y12,30);
		[x21,y21] = rotatePoint(0,0,x21,y21,30);
		[x22,y22] = rotatePoint(0,0,x22,y22,30);
	}


	const minX1 = Math.min(x11,x12); const maxX1 = Math.max(x11,x12);
	const minX2 = Math.min(x21,x22); const maxX2 = Math.max(x21,x22);

	const slope1 =(y11-y12)/(x11-x12); 
	const slope2 =(y21-y22)/(x21-x22);
	const coeff1 = -(x11*slope1) + y11;
	const coeff2 = -(x21*slope2) + y21;

	if(slope1===slope2) return false;
	const x = (coeff2 - coeff1)/(slope1 - slope2);
	const y = slope1*x + coeff1;
	if(((x>minX1)&&(x<maxX1))&&((x>minX2)&&(x<maxX2))) return [x,y];
	return false;
}


//<--------------------------OTHER SEGMENT FUNCTION------------------------------>
const findAngle3Point = (cx,cy,x1,y1,x2,y2) => Math.abs(findAngle2Point(cx,cy,x2,y2) - findAngle2Point(cx,cy,x1,y1))

//FIND THE 'HEIGHT' OF A POINT TO A SEGMENT
const findClosestPoint = function(x,y,s){
	const [x1,y1,x2,y2] = s

	let angle = findAngle3Point(x1,y1,x,y,x2,y2);
	const d = findDistance2Point(x,y,x1,y1);

	const d1 = Math.abs(d*Math.cos(degToRad(angle)));
	const d2 = Math.sqrt(Math.pow(d,2) - Math.pow(d1,2));

	if(d1 > findDistance2Point(x1,y1,x2,y2)) return false;

	angle = degToRad(findAngle2Point(x1,y1,x2,y2));
	const xh = x1 + Math.cos(angle) * d1; 
	const yh = y1 - Math.sin(angle) * d1;
	return [xh,yh,d2];
}

const changeByDotNotation = (propertyString,object,value) => {
	const propertyArray = propertyString.split(".")
	let objectLink = object
	propertyArray.forEach((e,i)=>{
		if (i === propertyArray.length - 1){
			if(Array.isArray(objectLink)) objectLink[parseInt(e)] = value
			else objectLink[e] = value
		}
		else{
			if(Array.isArray(objectLink)) objectLink = objectLink[parseInt(e)]
			else objectLink = objectLink[e]
		}
	})
}

const getByDotNotation = (propertyString,object)=>{
	const propertyArray = propertyString.split(".")
	let value = object
	propertyArray.forEach(e=>{
		if(Array.isArray(value)) value = value[parseInt(e)]
		else value=object[e]
	})
	return value
}

export {findClosestPoint,findAngle3Point,findAngle2Point,findIntersection,calculateRotatePoint,random,
mergeDefaultPropertyObject,findQuadrant,findDistance2Point,radToDeg,degToRad,rotatePoint,changeByDotNotation,getByDotNotation}