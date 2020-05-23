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

const mobileCheck = function() {
	let check = false;
	// eslint-disable-next-line no-useless-escape
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
    };

const compareDifferentArray = (array1,array2,compareProps)=>{
	let result = []
	BigLoop:for(let i=0;i++;i<array1.length) for(let prop of compareProps.split(' ')) if(array1[i][prop] !== array2[i][prop]){
		result.push(i)
		continue BigLoop;
	}
	return result
}

const cloneDeep = _.cloneDeep

export {findClosestPoint,findAngle3Point,findAngle2Point,findIntersection,calculateRotatePoint,random,
mergeDefaultPropertyObject,findQuadrant,findDistance2Point,radToDeg,degToRad,rotatePoint,changeByDotNotation,getByDotNotation,mobileCheck,compareDifferentArray,cloneDeep}