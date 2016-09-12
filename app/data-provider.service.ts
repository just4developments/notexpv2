import { Injectable }     from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable }     from 'rxjs/Observable';
import { Storage, SqlStorage, Loading, LoadingController } from 'ionic-angular';
import { Utils } from './utils.service';
import { TableAbs } from './table.abs';
import { Pref } from './pref';

const URL = 'http://api.clipvnet.com/api/savemoney';
// const URL = 'http://localhost:8001/api/savemoney';

@Injectable()
export class DataProviderService {
  Wallet: Wallet;
  Spending: Spending;
  TypeSpending: TypeSpending;

  storage: Storage;
  static me: any;
  static clientID: string;
  private static loader: Loading;
  private static loadingController: LoadingController;

  // public static me: any = {
  //   email: 'test@gmail',
  //   name: 'test',
  //   symb: 'VND'
  // };

  constructor (private http: Http, loadingController: LoadingController) {
    this.storage = new Storage(SqlStorage);
    this.Wallet = new Wallet(this.storage, this.http);
    this.Spending = new Spending(this.storage, this.http);
    this.TypeSpending = new TypeSpending(this.storage, this.http);
    if(Pref.has('me')) {
      DataProviderService.clientID = Pref.getItem('clientID');
      DataProviderService.me = Pref.getObject('me');
    }
    DataProviderService.loadingController = loadingController;
  }

  static loading(isShow: boolean){
    if(isShow) {
      DataProviderService.loader = DataProviderService.loadingController.create({
        content: "Please wait..."
      });
      return DataProviderService.loader.present();
    }else {
      return DataProviderService.loader.dismiss();
    }
  }

  setMe(user: any){
    if(!user.shares) user.shares = [];
    DataProviderService.me = user;
    DataProviderService.clientID = new Date().getTime().toString();
    Pref.setObject('me', DataProviderService.me);
    Pref.setItem('clientID', DataProviderService.clientID);
  }

  login(user: any): Observable<any>{
    return this.http.post(`${URL}/login`, user);
  }

  logout(fcDone){
    Pref.clear();
    fcDone();
  }

  share(email: string, fcDone: Function){
    this.http.post(`${URL}/share`, {email: email}, new RequestOptions({ headers: new Headers({ 'OAuth': DataProviderService.me.email })})).subscribe(res => {
      fcDone(res.json());
    });
  }

  noshare(email: string, fcDone: Function){
    this.http.delete(`${URL}/share/${email}`, new RequestOptions({ headers: new Headers({ 'OAuth': DataProviderService.me.email })})).subscribe(res => {
      fcDone(res.json());
    });
  }

  toList(rows: any): Array<any> {
    var rs:Array<any> = new Array();
    for(var i =0; i<rows.length; i++) {
      rs.push(rows.item(i));
    }
    return rs;
  }

  each(rows, fc): Array<any> {
    var rs:Array<any> = new Array();
    for(var i =0; i<rows.length; i++) {
      var vl:any;
      if((vl = fc(rows.item(i))))
        rs.push(vl);
    }
    return rs;
  }

  // getSpendings (): Observable<Response> {
  //   return this.http.get(`${URL}/spending?page=1&rows=20`, new RequestOptions({ headers: new Headers({ 'OAuth': DataProviderService.me.email })}));
  // }

  // getTypeSpendings(): Observable<Response> {
  //   return this.http.get(`${URL}/typespending`, new RequestOptions({ headers: new Headers({ 'OAuth': DataProviderService.me.email })}));
  // }

  // getWallets(): Observable<Response> {
  //   return this.http.get(`${URL}/wallet`, new RequestOptions({ headers: new Headers({ 'OAuth': DataProviderService.me.email })}));
  // }

}

class Wallet extends TableAbs {

  constructor(storage:Storage, http: Http) {
    super(storage, http, 'Wallet', 'ID', ['ID', 'name', 'icon', 'sicon', 'money', 'avail', 'server_id', 'symb', 'is_sync', 'email', 'removed', 'oder', '_id']);
  }

  init(fcDone:Function){
    this.storage.query("DROP TABLE IF EXISTS Wallet").then(() => {
      this.storage.query("CREATE TABLE IF NOT EXISTS Wallet       (ID TEXT PRIMARY KEY, name TEXT, icon TEXT, sicon TEXT, money REAL DEFAULT 0, avail INTEGER DEFAULT 1, server_id INTEGER, symb TEXT, is_sync NUMBER DEFAULT 0, email TEXT, removed INTEGER DEFAULT 0, oder DEFAULT 1, _id TEXT)").then(() => {
        fcDone();
      });
    });
  }

  install(lang: any, fcDone: Function){
    var datas:any = {
      en: [
        {name: 'Wallet', icon: [8, 9], avail: 1, money: 0, oder: 1},
        {name: 'ATM', icon: [8, 6], avail: 1, money: 0,  oder: 2},
        {name: 'Saving', icon: [6, 3], avail: 0, money: 0, oder: 3}
      ],
      vi: [
        {name: 'Ví tiền', icon: [8, 9], avail: 1, money: 0, oder: 1},
        {name: 'ATM', icon: [8, 6], avail: 1, money: 0, oder: 2},
        {name: 'Tạm để giành', icon: [0, 11], avail: 0, money: 0, oder: 3},
        {name: 'Tiền tiết kiệm', icon: [6, 3], avail: 0, money: 0, oder: 4}
      ]
    };
    datas = datas[lang];
    for(var i in datas){
      datas[i].sicon = TableAbs.getIcon(datas[i].icon, true);
      datas[i].icon = TableAbs.getIcon(datas[i].icon, false);
      datas[i]._id = null;
    }
    this.add(datas).then(fcDone());
  }

  syncFrom(page: number, rows: number, fcDone: Function, time?: any){
    time = time === undefined ? (Pref.getItem('sync.wallet.from') || 0) : time;
    this.http.get(`${URL}/wallet?page=${page}&rows=${rows}&time=${time}`, new RequestOptions({ headers: new Headers({ 'OAuth': DataProviderService.me.email })})).subscribe(res => {
      var data = res.json();
      if(data.length === 0) return fcDone((page-1) * rows);
      this.addFromServer(data).then(rs => {
        if(data.length > 0 && page === 1) Pref.setItem('sync.wallet.from', data[0].updatedAt);
        if(data.length < rows) fcDone((page-1) * rows + data.length);
        else this.syncFrom(page+1, rows, fcDone, time);
      });
    });
  }

  syncTo(fcDone: Function){
    this.select('WHERE is_sync = ?', [0]).then(resp => {
      if(resp.res.rows.length === 0) return fcDone(0);
      var idata:Array<any> = [],
          udata:Array<any> = [];
      for(var i =0; i<resp.res.rows.length; i++){
        var item = resp.res.rows.item(i);
        if(!item._id) idata.push(item);
        else udata.push(item);
      }
      var addData = (fcDone0) => {
        this.http.post(`${URL}/wallet`, {data: idata}, new RequestOptions({ headers: new Headers({ 'OAuth': DataProviderService.me.email })})).subscribe(res => {
          var data = res.json();
          this.updates(data.map(e => {
            e.is_sync = 1;
            return e;
          }), () => {
            fcDone0(idata.length);
          });
        });
      };
      var updateData = (fcDone0) => {
        this.http.put(`${URL}/wallet`, {data: udata}, new RequestOptions({ headers: new Headers({ 'OAuth': DataProviderService.me.email })})).subscribe(res => {
          this.updates(udata.map(e => {
            e.is_sync = 1;
            return e;
          }), () => {
            fcDone0(udata.length);
          });
        });
      }
      if(idata.length > 0){
        addData(t => {
          if(udata.length > 0){
            updateData(t0 => {
              fcDone(`added: ${t}, updated: ${t0}`);
            });
          }else{
            fcDone(`added: ${t}`);
          }
        });
      }else if(udata.length > 0){
        updateData(t0 => {
          if(idata.length > 0){
            addData(t => {
              fcDone(`added: ${t}, updated: ${t0}`);
            });
          }else{
            fcDone(`updated: ${t0}`);
          }
        });
      }
    });
  }

  addFromServer(items: any){
    if(!(items instanceof Array)) items = [items];
    return super._add(items.map(e=>{
      e.is_sync = 1;
      return e;
    }));
  }

  add(items: any){
    if(!(items instanceof Array)) items = [items];
    return super._add(items.map(e=>{
      e.ID = Utils.getUID();
      e.email = DataProviderService.me.email;
      e.is_sync = 0;
      e.symb = DataProviderService.me.symb;
      return e;
    }));
  }

  update(item: any){
    item.is_sync = 0;
    return super._update(item);
  }

  remove(item){
    if(item.is_sync === 0){
      return super._remove(item);
    }else{
      return super._update({ID: item.ID, is_sync: 0, removed: 1});
    }
  }

}

class Spending extends TableAbs {

  constructor(storage:Storage, http: Http) {
    super(storage, http, 'Spending', 'ID', ['ID', 'money', 'created_date', 'created_day', 'created_month', 'created_year', 'type_spending_id', 'wallet_id', 'des', 'udes', 'type', 'is_report', 'server_id', 'is_sync', 'email', 'removed', '_id']);
  }

  init(fcDone: Function){
    this.storage.query("DROP TABLE IF EXISTS Spending").then(() => {
      this.storage.query("CREATE TABLE IF NOT EXISTS Spending     (ID TEXT PRIMARY KEY, money REAL, created_date INTEGER, created_day INTEGER, created_month INTEGER, created_year INTEGER, type_spending_id TEXT, wallet_id TEXT, des TEXT, udes TEXT, type INTEGER  DEFAULT -1, is_report INTEGER default 1, server_id INTEGER, is_sync NUMBER DEFAULT 0, email TEXT, removed INTEGER DEFAULT 0, _id TEXT)").then(() => {
        fcDone();
      });
    });
  }

  syncFrom(page: number, rows: number, fcDone: Function, time?: any){
    time = time === undefined ? (Pref.getItem('sync.spending.from') || 0) : time;
    this.http.get(`${URL}/spending?page=${page}&rows=${rows}&time=${time}`, new RequestOptions({ headers: new Headers({ 'OAuth': DataProviderService.me.email })})).subscribe(res => {
      var data = res.json();
      if(data.length === 0) return fcDone((page-1) * rows);
      this.addFromServer(data).then(rs => {
        if(data.length > 0 && page === 1) Pref.setItem('sync.spending.from', data[0].updatedAt);
        if(data.length < rows) fcDone((page-1) * rows + data.length);
        else this.syncFrom(page+1, rows, fcDone, time);
      });
    });
  }

  syncTo(fcDone: Function){
    this.select('WHERE is_sync = ?', [0]).then(resp => {
      if(resp.res.rows.length === 0) return fcDone(0);
      var idata:Array<any> = [],
          udata:Array<any> = [];
      for(var i =0; i<resp.res.rows.length; i++){
        var item = resp.res.rows.item(i);
        if(!item._id) idata.push(item);
        else udata.push(item);
      }
      var addData = (fcDone0) => {
        this.http.post(`${URL}/spending`, {data: idata}, new RequestOptions({ headers: new Headers({ 'OAuth': DataProviderService.me.email })})).subscribe(res => {
          var data = res.json();
          this.updates(data.map(e => {
            e.is_sync = 1;
            return e;
          }), () => {
            fcDone0(idata.length);
          });
        });
      };
      var updateData = (fcDone0) => {
        this.http.put(`${URL}/spending`, {data: udata}, new RequestOptions({ headers: new Headers({ 'OAuth': DataProviderService.me.email })})).subscribe(res => {
          this.updates(udata.map(e => {
            e.is_sync = 1;
            return e;
          }), () => {
            fcDone0(udata.length);
          });
        });
      }
      if(idata.length > 0){
        addData(t => {
          if(udata.length > 0){
            updateData(t0 => {
              fcDone(`added: ${t}, updated: ${t0}`);
            });
          }else{
            fcDone(`added: ${t}`);
          }
        });
      }else if(udata.length > 0){
        updateData(t0 => {
          if(idata.length > 0){
            addData(t => {
              fcDone(`added: ${t}, updated: ${t0}`);
            });
          }else{
            fcDone(`updated: ${t0}`);
          }
        });
      }
    });
  }

  addFromServer(items: any){
    if(!(items instanceof Array)) items = [items];
    return super._add(items.map(e=>{
      e.is_sync = 1;
      return e;
    }));
  }

  add(item: any){
    item.ID = Utils.getUID();
    item.email = DataProviderService.me.email;
    item.is_sync = 0;
    item.removed = 0;
    item.des = item.des || null;
    item.is_report = item.is_report ? 1 : 0;
    return super._add(item);
  }

  update(item: any){
    item.is_sync = 0;
    return super._update(item);
  }

  remove(item){
    if(item.is_sync === 0){
      return super._remove(item);
    }else{
      return super._update({ID: item.ID, is_sync: 0, removed: 1});
    }
  }

}

class TypeSpending extends TableAbs {

  constructor(storage:Storage, http: Http) {
    super(storage, http, 'TypeSpending', 'ID', ['ID', 'name', 'icon', 'sicon', 'parent_id', 'type', 'oder', 'server_id', 'is_sync', 'email', 'removed', '_id']);
  }

  init(fcDone:Function){
    this.storage.query("DROP TABLE IF EXISTS TypeSpending").then(() => {
      this.storage.query("CREATE TABLE IF NOT EXISTS TypeSpending (ID TEXT PRIMARY KEY, name TEXT, icon TEXT, sicon TEXT, parent_id TEXT, type INTEGER  DEFAULT -1, oder INTEGER DEFAULT 1000, server_id INTEGER, is_sync NUMBER DEFAULT 0, email TEXT, removed INTEGER DEFAULT 0, _id TEXT)").then(() => {
        fcDone();
      });
    });
  }

  install(lang: any, fcDone:Function){
    var datas:any = {
      vi: [
        // TypeOthers
        { oder: 1, name: 'Received from wallet', icon: [9, 11], type: 0},
        { oder: 1, name: 'Transfer to wallet', icon: [6, 10], type: 0},
        { oder: 1, name: 'Add new wallet', icon: [0, 10], type: 0},
        { oder: 1, name: 'Update wallet', icon: [0, 10], type: 0},

        // TypeEarning
        { oder: 1, name: 'Lương', icon: [9, 2], type: 1,
          inner: [
            { oder: 2, name: 'Thưởng', icon: [7, 9], type: 1 }
          ]
        },
        { oder: 3, name: 'Bán hàng', icon: [10, 0], type: 1 },
        { oder: 4, name: 'Được cho', icon: [6, 11], type: 1 },
        { oder: 5, name: 'Tiền lãi', icon: [7, 11], type: 1 },
        { oder: 100, name: 'Khoản thu khác', icon: [1, 4], type: 1 },

        // TypeSpending
        { oder: 1, name: 'Gia đình', icon: [9, 10], type: -1,
          inner: [
            { oder: 2, name: 'Con cái', icon: [10, 6], type: -1 }
          ]
        },
        { oder: 3, name: 'Điện & nước & internet', icon: [12, 6], type: -1 },
        { oder: 3, name: 'Ăn uống', icon: [1, 0], type: -1 },
        { oder: 4, name: 'Bạn bè & người yêu', icon: [0, 0], type: -1 },
        { oder: 5, name: 'Du lịch', icon: [11, 0], type: -1 },
        { oder: 7, name: 'Giáo dục', icon: [7, 10], type: -1 },
        { oder: 8, name: 'Mua sắm', icon: [2, 0], type: -1 },
        { oder: 9, name: 'Y tế & Sức khoẻ', icon: [2, 11], type: -1 },
        { oder: 10, name: 'Đi lại', icon: [1, 2], type: -1 },
        { oder: 10, name: 'Cho vay', icon: [6, 10], type: -1 },
        { oder: 100, name: 'Khoản chi phí khác', icon: [1, 4], type: -1 }
      ],
      en: [
        // TypeOthers
        { oder: 1, name: 'Received from wallet', icon: [9, 11], type: 0},
        { oder: 1, name: 'Transfer to wallet', icon: [6, 10], type: 0},
        { oder: 1, name: 'Add new wallet', icon: [0, 10], type: 0},
        { oder: 1, name: 'Update wallet', icon: [0, 10], type: 0},

        // TypeEarning
        { oder: 1, name: 'Salary', icon: [9, 2], type: 1,
          inner: [
            { oder: 2, name: 'Bonus', icon: [7, 9], type: 1 }
          ]
        },
        { oder: 3, name: 'Selling', icon: [10, 0], type: 1 },
        { oder: 4, name: 'Gifts', icon: [6, 11], type: 1 },
        { oder: 5, name: 'Interest', icon: [7, 11], type: 1 },
        { oder: 100, name: 'Other Income', icon: [1, 4], type: 1 },

        // TypeSpending
        { oder: 1, name: 'Family', icon: [9, 10], type: -1,
          inner: [
            { oder: 2, name: 'Children', icon: [10, 6], type: -1 }
          ]
        },
        { oder: 3, name: 'Electric - Water - Internet', icon: [12, 6], type: -1 },
        { oder: 3, name: 'Food - Beverage', icon: [1, 0], type: -1 },
        { oder: 4, name: 'Friend - Love', icon: [0, 0], type: -1 },
        { oder: 5, name: 'Travel', icon: [11, 0], type: -1 },
        { oder: 7, name: 'Education', icon: [7, 10], type: -1 },
        { oder: 8, name: 'Shopping', icon: [2, 0], type: -1 },
        { oder: 9, name: 'Health - Fitness', icon: [2, 11], type: -1 },
        { oder: 10, name: 'Transportation', icon: [1, 2], type: -1 },
        { oder: 10, name: 'Loan', icon: [6, 10], type: -1 },
        { oder: 100, name: 'Other Expendse', icon: [1, 4], type: -1 }
      ]
    };
    datas = datas[lang];
    var data:Array<any> = [];
    for(var data0 of datas){
      data0.ID = Utils.getUID();
      data0.sicon = TableAbs.getIcon(data0.icon, true);
      data0.icon = TableAbs.getIcon(data0.icon, false);
      data0._id = null;
      if(data0.inner){
        for(var data1 of data0.inner){
          data1.ID = Utils.getUID();
          data1.sicon = TableAbs.getIcon(data1.icon, true);
          data1.icon = TableAbs.getIcon(data1.icon, false);
          data1.parent_id = data0.ID;
          data1._id = null;
          data.push(data1);
        }
      }
      delete data0.inner;
      data.push(data0);
    }
    this.add(datas).then(fcDone());
  }

  syncFrom(page: number, rows: number, fcDone: Function, time?: any){
    time = time === undefined ? (Pref.getItem('sync.typespending.from') || 0) : time;
    this.http.get(`${URL}/typespending?page=${page}&rows=${rows}&time=${time}`, new RequestOptions({ headers: new Headers({ 'OAuth': DataProviderService.me.email })})).subscribe(res => {
      var data = res.json();
      if(data.length === 0) return fcDone((page-1) * rows);
      this.addFromServer(data).then(rs => {
        if(data.length > 0 && page === 1) Pref.setItem('sync.typespending.from', data[0].updatedAt);
        if(data.length < rows) fcDone((page-1) * rows + data.length);
        else this.syncFrom(page+1, rows, fcDone, time);
      });
    });
  }

  syncTo(fcDone: Function){
    this.select('WHERE is_sync = ?', [0]).then(resp => {
      if(resp.res.rows.length === 0) return fcDone(0);
      var idata:Array<any> = [],
          udata:Array<any> = [];
      for(var i =0; i<resp.res.rows.length; i++){
        var item = resp.res.rows.item(i);
        if(!item._id) idata.push(item);
        else udata.push(item);
      }
      var addData = (fcDone0) => {
        this.http.post(`${URL}/typespending`, {data: idata}, new RequestOptions({ headers: new Headers({ 'OAuth': DataProviderService.me.email })})).subscribe(res => {
          var data = res.json();
          this.updates(data.map(e => {
            e.is_sync = 1;
            return e;
          }), () => {
            fcDone0(idata.length);
          });
        });
      };
      var updateData = (fcDone0) => {
        this.http.put(`${URL}/typespending`, {data: udata}, new RequestOptions({ headers: new Headers({ 'OAuth': DataProviderService.me.email })})).subscribe(res => {
          this.updates(udata.map(e => {
            e.is_sync = 1;
            return e;
          }), () => {
            fcDone0(udata.length);
          });
        });
      }
      if(idata.length > 0){
        addData(t => {
          if(udata.length > 0){
            updateData(t0 => {
              fcDone(`added: ${t}, updated: ${t0}`);
            });
          }else{
            fcDone(`added: ${t}`);
          }
        });
      }else if(udata.length > 0){
        updateData(t0 => {
          if(idata.length > 0){
            addData(t => {
              fcDone(`added: ${t}, updated: ${t0}`);
            });
          }else{
            fcDone(`updated: ${t0}`);
          }
        });
      }
    });
  }

  addFromServer(items: any){
    if(!(items instanceof Array)) items = [items];
    return super._add(items.map(e=>{
      e.is_sync = 1;
      return e;
    }));
  }

  add(items: any){
    if(!(items instanceof Array)) items = [items];
    return super._add(items.map(e=>{
      if(!e.ID) e.ID = Utils.getUID();
      e.email = DataProviderService.me.email;
      e.is_sync = 0;
      return e;
    }));
  }

  update(item: any){
    item.is_sync = 0;
    return super._update(item);
  }

  remove(item){
    if(item.is_sync === 0){
      return super._remove(item);
    }else{
      return super._update({ID: item.ID, is_sync: 0, removed: 1});
    }
  }

}
