declare var localStorage: any;

export class Pref {
	static has(key: string){
		return key in localStorage;
	}
	static setObject(key:string, vl:any) {
	  this.setItem(key, JSON.stringify(vl));
	};
	static getObject(key:string): Object{
	  var vl = this.getItem(key);	  
	  if(vl === undefined) return vl;
	  vl = JSON.parse(vl);
	  return vl;
	}
	static setItem(key:string, vl: any){
		localStorage.setItem(key, vl);
	}
	static getItem(key:string){
		return localStorage.getItem(key);
	}
	static clear(){
		localStorage.clear();
	}
}