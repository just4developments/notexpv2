
export class Utils {
  static uniUID: number = 0;
  static oldUID: string;
  static getUID() {
    var time = new Date().getTime();
    var uid = Utils.uniUID + "." + time;
    if(Utils.oldUID === uid) Utils.oldUID = ++Utils.uniUID + "." + time;
    else Utils.oldUID = uid;
    return Utils.oldUID;
  }

  static find(arrs, fcFind){
		var rs:Array<any> = [];
		for(var e of arrs){
			if(fcFind(e) === true){
				rs.push(e);
			}
		}
		return rs;
	}

  static clone(obj: any){
    return JSON.parse(JSON.stringify(obj));
  }
}