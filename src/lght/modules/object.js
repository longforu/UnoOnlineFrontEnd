import {mergeDefaultPropertyObject, rotatePoint, degToRad, findAngle2Point, findDistance2Point, findIntersection, findClosestPoint} from "../util/util"

module.exports = (lght)=>{
    //TOTAL OBJECT COUNT, USED TO PRODUCE ID
    lght.objectCount = 0;

    lght.object = class {
        constructor(property,parent){
            lght.objectCount++
            lght.objectCount++;
            this.id = lght.objectCount;
            this.parent = parent;
            this.parent.object.push(this)
            mergeDefaultPropertyObject
            (property,lght.defaultObjectProps,this);    
            this.initFunctions.forEach((e)=>this[e]())        
            this.name = (property.objectName)?property.objectName:`Object ${this.id}`
        }

        collide(obj){
            this.shapes.forEach(s1=>{
                obj.shapes.forEach(s2=>{
                    if(s1.collide(s2)) return true
                })
            })
            return false
        }

        pointInObject(x,y){
            this.shapes.forEach(s=>{
                if(s.pointInObject(x,y)) return true
            })
            return false
        }

        findMax(){
            let xs = []
            let ys = []
            this.shapes.forEach(s=>{
                let [minX,maxX,minY,maxY] = s.findMax()
                xs.concat([minX,maxX])
                ys.concat([minY,maxY])
            })
            return [Math.min(...xs),Math.max(...xs),Math.min(...ys),Math.max(...ys)]
        }
    }

    lght.shape = class {
        constructor (property,parent) {
            this.kind = property.kind
            this.parent = parent;
            this.parent.shapes.push(this);
            mergeDefaultPropertyObject
            (property,lght.defaultShapeOptions,this);
            this.parent.updateVisual()
        }

        kill (){
            this.parent.shapes.splice(this.parent.shapes.indexOf(this),1);
        }

        get absoluteX(){
            return this.x + this.parent.x
        }

        get absoluteY(){
            return this.y + this.parent.y
        }

        get hasBorder(){
            return this.border||this.borderOnly
        }

        get width(){
            return (this.hasBorder)?this.width + this.borderWidth:this.width

        }

        get height(){
            return (this.hasBorder)?this.height + this.borderWidth:this.height
        }

        get outOfBound(){
            let [minX,maxX,minY,maxY] = this.findMax();
            let {width,height} = this.parent.parent.canvas;
            return (minX > width || maxX < 0 || minY > height || maxY < 0) 
        }

        findVertex(){
            return []
        }

        findMax(){
            let vertex = this.findVertex
            let xs = []
            let ys = []

            vertex.forEach(([x,y])=>{
                xs.push(x); ys.push(y)
            })

            return [
                Math.min(...xs),
                Math.max(...xs),
                Math.min(...ys),
                Math.max(...ys)
            ]
        }

        pointInShape(x,y){
            let sides = this.findSides()
            let maxX = this.findMax()[1]
            let maxY = this.findMax()[3]
            let distance = findDistance2Point(this.absoluteX,this.absoluteY,maxX,maxY)
            let compareSide = [this.absoluteX,this.absoluteY,this.absoluteX+distance,this.absoluteY]
            let intersect = 0
            sides.forEach(e=>{
                if(findIntersection(e,compareSide)) intersect++
            })
            return (intersect%2 === 0)
        }

        findSides(){
            let vertex = this.findVertex()
            let result = []
            for(let i = 0;i<vertex.length;i++){
                result.push([...vertex[i],...((vertex[i+1])?vertex[i+1]:vertex[0])])
            }
            return result
        }

        collide(shape){
            if(shape.kind==='arc') return shape.collide(this)
            let [maxX1,minX1,maxY1,minY1] = this.findMax()
            let [maxX2,minX2,maxY2,minY2] = shape.findMax()
            if (((minX1 < minX2) && (maxX1 > maxX2) && (minY1<minY2) && (maxY1>maxY2)) || ((minX2 < minX1) && (maxX2 > maxX1) && (minY2<minY1) && (maxY2>maxY1))) return true

            let side1 = this.findSides()
            let side2 = shape.findSides()

            side1.forEach(s1=>{
                side2.forEach(s2=>{
                    if(findIntersection(s1,s2)) return true
                })
            })
            return false
        }
    }

    lght.rect = class extends lght.shape{
        constructor (property,parent){
            super(property,parent)
            mergeDefaultPropertyObject(property,lght.defaultRectOptions,this)
        }

        findVertex(){
            let reference = [[1,-1],[-1,-1],[-1,1],[1,1]]
            let result = []
            reference.forEach(([rx,ry])=>{
                let nx = this.absoluteX + 0.5*this.width*rx
                let ny = this.absoluteY + 0.5*this.height*ry
                result.push(rotatePoint(this.absoluteX,this.absoluteY,nx,ny,this.rotation))
            })
            return result
        }
    }

    lght.arc = class extends lght.shape{
        constructor (property,parent){
            super(property,parent)
            mergeDefaultPropertyObject(property,lght.defaultArcOptions,this)
        }

        get radius(){
            return (this.hasBorder)?this.rad + this.borderWidth : this.rad
        }

        get minAngle(){
            return this.rotation
        }

        get maxAngle(){
            return this.rotation + this.arcDegree
        }

        get minRadAngle(){
            return degToRad(this.minAngle)
        }

        get maxRadAngle(){
            return degToRad(this.maxAngle)
        }

        get pureCircle(){
            return this.arcDegree===360
        }

        pointInShape(x,y){
            var angle = findAngle2Point(this.absoluteX,this.absoluteY,x,y)
            if (angle>this.minAngle && angle<this.maxAngle){
                if(findDistance2Point(this.absoluteX,this.absoluteY,x,y)<=this.radius) return true
            }
            return false
        }

        findMax(){
            let result = [this.absoluteX-this.radius,this.absoluteX+this.radius,this.absoluteY-this.radius,this.absoluteY+this.radius]
            let xs = [this.absoluteX,this.absoluteX+Math.cos(this.minRadAngle)*this.radius,this.absoluteX+Math.cos(this.maxRadAngle)*this.radius]
            let ys = [this.absoluteY,this.absoluteY-Math.sin(this.minRadAngle)*this.radius,this.absoluteY-Math.sin(this.maxRadAngle)*this.radius]
            if(!this.pointInShape(result[0],this.absoluteY)) result[0] = Math.min(...xs);
            if(!this.pointInShape(result[1],this.absoluteY)) result[1] = Math.max(...xs);
            if(!this.pointInShape(this.absoluteX,result[2])) result[2] = Math.min(...ys);
            if(!this.pointInShape(this.absoluteX,result[3])) result[3] = Math.max(...ys);
            return result
        }

        findVertex(){
            let [minX,maxX,minY,maxY] = this.findMax()
            let referenceX = [this.absoluteX+Math.cos(this.minRadAngle)*this.radius,this.absoluteX+Math.cos(this.maxRadAngle)*this.radius,this.absoluteX+this.radius,this.absoluteX-this.radius,this.absoluteX]
            let referenceY = [this.absoluteY-Math.sin(this.minRadAngle)*this.radius,this.absoluteY-Math.sin(this.maxRadAngle)*this.radius,this.absoluteY+this.radius,this.absoluteY-this.radius,this.absoluteY]

            return [
                [minX,referenceY[referenceX.indexOf(minX)]],
                [maxX,referenceY[referenceX.indexOf(maxX)]],
                [referenceX[referenceY.indexOf(minY)],minY],
                [referenceX[referenceY.indexOf(maxY)],maxY],
            ]
        }

        fidnSides(){
            if(this.arcDegree === 360) return false
            return [
                [this.absoluteX,this.absoluteY,this.absoluteX+Math.cos(this.minRadAngle)*this.radius,this.absoluteY-Math.sin(this.minRadAngle)*this.radius],
                [this.absoluteX,this.absoluteY,this.absoluteX+Math.cos(this.maxRadAngle)*this.radius,this.absoluteY-Math.sin(this.maxRadAngle)*this.radius]
            ]
        }

        collide(shape){
            if(shape.kind==='arc'){                
                //when checking for intersection between 2 arcs, there are 2 cases
                //Case 1: they are both circles. In this case the distance between the 2 center have to be smaller or equal to
                //sum of radius for them to intersect

                if(this.pureCircle && shape.pureCircle){
                    return findDistance2Point(this.absoluteX,this.absoluteY,shape.absoluteX,shape.absoluteY) <= this.radius + shape.radius
                }

                //Case 2: either of them are arcs
                //In these cases, there are 2 scenarios
                //Scenario 1: one of the vertexes will be inside the circle, this is easy to check
                //Scenario 2: none of the vertex is inside the circle. There is only one possible explanation for this. In this case, check if 
                //the "ray" that connect the 2 center is inside both arcs, then check that the length of the ray is less than the length of both radius

                let vertex1 = this.findVertex()
                let vertex2 = shape.findVertex()

                vertex1.forEach(([x,y]) => {
                    if(shape.pointInShape(x,y)) return true
                })
                vertex2.forEach(([x,y])=>{
                    if(this.pointInShape(x,y)) return true
                })

                if(findDistance2Point(this.absoluteX,this.absoluteY,shape.absoluteX,shape.absoluteY) > this.radius + shape.radius) return false

                let ray1 = findAngle2Point(this.absoluteX,this.absoluteY,shape.absoluteX,shape.absoluteY)
                let ray2 = findAngle2Point(shape.absoluteX,shape.absoluteY,this.absoluteX,this.absoluteY)
                return ((ray1<this.maxAngle&&ray1>this.minAngle)&&(ray2<shape.maxAngle&&ray2>shape.minAngle))
            }
            else{
                let side = shape.findSides()
                side.forEach(s=>{
                    let closest = findClosestPoint(this.absoluteX,this.absoluteY,s)
                    if(closest){
                        if (this.pointInShape(closest[0],closest[1])) return true
                    }
                })
                return false;
            }
        }
    }

    lght.text = class extends lght.shape{
        constructor (property,parent){
            super(property,parent)
            mergeDefaultPropertyObject(property,lght.defaultTextOptions,this)
        }

        get textSize(){
            var c = lght.apps[0].context;
            c.save();
            c.font = this.font;
            var width = c.measureText(this.text).width;
            var height = c.measureText('gM').width;
            c.restore();
            return [width,height];
        }

        get w(){
            return this.textSize[0]
        }

        get h(){
            return this.textSize[1]
        }

        findVertex(){
            let reference = [[2,-2],[0,-2],[0,0.5],[2,0.5]]
            let result = []
            reference.forEach(([rx,ry])=>{
                let nx = this.absoluteX + 0.5*this.width*rx
                let ny = this.absoluteY + 0.5*this.height*ry
                result.push(rotatePoint(this.absoluteX,this.absoluteY,nx,ny,this.rotation))
            })
        }
    }

    lght.img = class extends lght.shape{
        constructor (property,parent){
            super(property,parent)
            mergeDefaultPropertyObject(property,lght.defaultImgOptions,this)
        }

        get w(){
            return this.sprite.width
        }

        get h(){
            return this.sprite.height
        }
    }

    lght.object.prototype.addShape = (property) => {
        return new lght[property.kind](property,this);
    }

    lght.app.prototype.addObject = (property) => {
        return new lght.object(property,this);
    }

    lght.app.prototype.removeObject = (obj) => {
        this.objects.splice(this.objects.indexOf(obj),1);
    }
    return lght
}


