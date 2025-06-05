const fs = require("fs")
const path = require("path").posix
const util = require("util")
const _ = init()

;( () => {

	let pw = process.cwd()
	pw = pw.replace( /\\/g, "/" )
	let arg = process.argv.slice(2)[0]
	if( arg && !/\\|\//g.test(arg) )
		arg = path.join( pw , arg )

	// console.log( `console.log 'test:${arg}'` )
	// return

	// colors ( vRGB ) =>

	const vRGB = require("./vRGB_module_exp")

	let colors = vRGB(19)
	let list = [1,2,10,11,13,14,17]
	let offset = 0
	for( let n of list ){
		colors.splice(n-offset,1)
		offset++
	}
	colors.pop()

	// colors ( vRGB ) <=

	let data = fs.readFileSync( arg /*"../app.coffee"*/ , "utf8" )
	.split(/\r\n|\n/)
	.filter( x => x != "" )

	let w = depthArray(data).sort( (a,b) => a.isFunction - b.isFunction )
	// console.log( w )

	mutForObject( w, (x,k,obj) => {
		if( obj?.array ){
			obj.array.sort( (a,b) => a.isFunction - b.isFunction )
		}
	})

	console.log( backToStr(w) )

	// fs.writeFileSync( "TwWKBaP7natb.coffee", backToStr(w) )

})()

;( async () => {

	// ...

	server( `
	<style>
	body {
		font-family:monospace;
		font-size: 20px;
		background: #1D1F21;
		color:white;
	}

	ul,li {
		margin-top: 0;
		list-style: none;
	}

	li.child::before {

		content: "\\2022";
		color: var(--color);
		display: inline-block;
		margin-right: 8px;
		transform: translateY(-1px) scale(1.5);

	}
	</style>
	<div style="display:flex">
	</div>
	`
	+
	jsontree3( w /*depthArray(data)*/ )

	, "html" )

})/*()*/

function isFunction(str){
	if( /http\.createServer/.test(str) ) return 1
	let bool = ( (/(|\s+)\(.*\)(|\s+)->|=(|\s+)->|=>/g).test(str)
	&& !(/(|\s+)\(\(\)(|\s+)=>|(|\s+)\(\)(|\s+)->/).test(str) )
	return !bool+0 /*{ bool,str }*/
}

function backToStr( array, obj = { str: "" } ){

	for ( let x of array ) {

		obj.str += x.str + "\n"
		backToStr( x.array, obj )

	}

	return obj.str

}

function mutForObject(x,callback,p=[],i=0){

	let last = (x,n) => x[(x.length)-n]

	for ( let key of Object.keys(x) ){

		callback( x[key],key,x, /*p,last*/ ) // x,k,p,last p : table of parent

		if ( typeof x[key] == "object" && x[key] != null ){

			p.push(x[key])
			mutForObject(x[key],callback,p,i+1)
			p.pop()

		}
	}

}

function jsontree3( array, obj = { str: "<ul style='padding:0;'>" }, level=0 ){

	for ( let x of array ) {

		obj.str += `<li class="child" data-level="${level}" style="--color:${colors[level].rgb};" >${x.str.toString().trim()}</li>`
		obj.str += `<ul>`

			jsontree3( x.array, obj, level+1 )

		obj.str += `</ul>`

	}

	return obj.str + "</ul>"

}

function depthArray( m, array=[] ){

	let last = (array,n) => {
		if( n == 0 ) return array
		return (new Array(n)).fill(0).reduce( (o,i) => {
			let v = o.at(-1).array
			if(!v)
				v = o.at(-1)
			return v
		}, array )
	}

	for( let x of m ){
		let level = x.fmatch(/\t/g).length
		;( v => v.bool ? console.log( v.str.trim() , level ) : null )( isFunction(x) )
		last(array,level).push( { str:x, level:level, array:[], isFunction:isFunction(x) } )
	}
	return array

}

function server(x,n){

	const http = require("http")
	const PORT = 8080

	http.createServer( (req,res) => {

		res.writeHead(200,{"content-type":`text/${n};charset=utf8`})

		res.end(x)

	}).listen(PORT)

	console.log(`Running at port ${PORT}`)

}

function init(){

	String.prototype.fmatch = function(reg) {
		let v = this.match(reg)
		if ( !v )
		return []
		else
		return v
	}

	return require("lodash")

}

/*.bashrc

coffee4() {
  coffee -e "$( node 'C:/coffee_compiler/app.js' "$1.coffee" )"
}*/
