import { Storage } from 'ionic-angular';
import { Http } from '@angular/http';

export abstract class TableAbs {

  constructor(protected storage:Storage, protected http:Http, protected table?: string, protected key?: string, private arrFields?:Array<string>){
    
  }

  public select(where?: string, prms?: Array<any>, ...fields){
  	return this.storage.query(`SELECT ${fields.length > 0 ? fields.join(',') : '*'} FROM ${this.table} ${where || ''}`, prms || []);
  }

  public _add(obj: any){
  	var queries: Array<any> = [];  	
  	var fields: Array<string> = [];
  	var prms: Array<any> = [];
  	if(!(obj instanceof Array)){
  		obj = [obj];
	  }    
	  for(var i in obj){
	  	var query: Array<string> = [];
			for(var k in obj[i]){
        if(this.arrFields.indexOf(k) === -1) continue;
	  		if(queries.length === 0) fields.push(k);
	  		query.push('?');
	  		prms.push(obj[i][k]);
	  	}
			queries.push(`(${query.join(',')})`);
		}	
    return this.storage.query(`INSERT INTO ${this.table} (${fields.join(',')}) values ${queries.join(',')}`, prms);
  }

  public updates(objs: Array<any>, fcDone: Function){
    var update0 = (idx: number) => {
      if(idx === objs.length) return fcDone();
      var obj = objs[idx];
      this._update(obj).then(resp => {
        update0(idx+1);
      });
    };
    update0(0);
  }

  public _update(obj: any){
  	var fields: Array<string> = [];
  	var prms: Array<any> = [];
  	for(var k in obj){
      if(this.arrFields.indexOf(k) === -1) continue;
  		if(k === this.key) continue;
  		fields.push(`${k}=?`);
  		prms.push(obj[k]);
  	}
  	prms.push(obj[this.key]);
  	return this.storage.query(`UPDATE ${this.table} SET ${fields.join(',')} WHERE ${this.key} = ?`, prms);
  }

	public _remove(obj: any){
  	return this.storage.query(`DELETE FROM ${this.table} WHERE ${this.key} = ?`, [obj[this.key]]);
  }  

  public static getIcon(indexs, isSicon) {
    var left:number = 53,
        top:number = 64,
        sleft:number = 24*53/36,
        stop:number = 24*64/36;
    if(isSicon)
      return "-" + (sleft * indexs[0]) + "px -" + (stop * indexs[1]) + "px";
    return "-" + (left * indexs[0]) + "px -" + (top * indexs[1]) + "px";
  }

}