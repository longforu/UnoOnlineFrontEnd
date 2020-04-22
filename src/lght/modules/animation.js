import {changeByDotNotation, getByDotNotation} from '../util/util'

module.exports = (lght)=>{
	lght.app.prototype.animate = () => {
		if(lght.frameTime !== undefined && lght.lastFrame !== undefined){
			let timeDifference = lght.frameTime - lght.lastFrame
			this.objects.forEach(e => {
				e.animate(timeDifference);
				e.shapes.forEach(a => {
					a.animate(timeDifference)
				})
			});
		}
	}

	let addAnimation = (property,value,time,func)=>{
		this.animationCount++;
		let id = this.animationCount;
		let obj = this

		let timeout = setTimeout(()=>{
			changeByDotNotation(property,obj,value)
			if(func) func();
			obj.cancelAnimation(id);
		},time)

		this.animations.push([property,value,getByDotNotation(property,this),time,timeout,func,id]);
		return id;
	}

	let cancelAnimation = function(){
		let {animations} = this
		arguments.forEach(id=>{
			let animation = animations.find(e=>e[6] === id)
			let index = animations.findIndex(e=>e[6]===id)
			if(!animation) return false
			clearTimeout(animation[4])
			animations.splice(index,1)
		})
	}

	let animate = (time)=>{
		let obj = this
		this.animations.forEach(animation=>{
			let [property,value,init,timeUp] = animation
			let newValue = getByDotNotation(property,obj) + (time/timeUp)*(value-init)
			changeByDotNotation(property,obj,newValue)
		})
		obj.updateVisual()
	}

	lght.animateFunctionReference = {
		animate,
		addAnimation,
		cancelAnimation,
	}

	for(var prop in lght.animateFunctionReference){
		lght.object.prototype[prop] = lght.animateFunctionReference[prop];
		lght.shape.prototype[prop] = lght.animateFunctionReference[prop];
	}
	return lght
}

