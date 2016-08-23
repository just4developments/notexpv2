import { Storage } from 'ionic-angular';
import { TableAbs } from './table.abs';
import { Utils } from './utils.service';
import { DataProviderService } from './data-provider.service';

export class InitData extends TableAbs {
  left:number = 53;
  top:number = 64;
  sleft:number = 24*53/36;
  stop:number = 24*64/36;

  constructor(storage:Storage) {
    super(storage, null);
  }

  setupDB(fcDone) {
    this.storage.query("DROP TABLE IF EXISTS Wallet").then(() => {
      this.storage.query("DROP TABLE IF EXISTS TypeSpending").then(() => {
        this.storage.query("DROP TABLE IF EXISTS Spending").then(() => {
          this.storage.query("CREATE TABLE IF NOT EXISTS Wallet       (ID TEXT PRIMARY KEY, name TEXT, icon TEXT, sicon TEXT, money REAL DEFAULT 0, avail INTEGER DEFAULT 1, server_id INTEGER, symb TEXT, is_sync NUMBER DEFAULT 0, email TEXT, removed INTEGER DEFAULT 0, oder DEFAULT 1)").then(() => {
            this.storage.query("CREATE TABLE IF NOT EXISTS TypeSpending (ID TEXT PRIMARY KEY, name TEXT, icon TEXT, sicon TEXT, parent_id TEXT, type INTEGER  DEFAULT -1, oder INTEGER DEFAULT 1000, server_id INTEGER, is_sync NUMBER DEFAULT 0, email TEXT, removed INTEGER DEFAULT 0)").then(() => {
              this.storage.query("CREATE TABLE IF NOT EXISTS Spending     (ID TEXT PRIMARY KEY, money REAL, created_date INTEGER, created_day INTEGER, created_month INTEGER, created_year INTEGER, type_spending_id TEXT, wallet_id TEXT, des TEXT, udes TEXT, type INTEGER  DEFAULT -1, is_report INTEGER default 1, server_id INTEGER, is_sync NUMBER DEFAULT 0, email TEXT, removed INTEGER DEFAULT 0)").then(() => {
                console.log('Setup db done');
                fcDone();
              });
            });  
          });  
        });
      });  
    });
  }

  getIcon(indexs, isSicon) {
    if(isSicon)
      return "-" + (this.sleft * indexs[0]) + "px -" + (this.stop * indexs[1]) + "px";
    return "-" + (this.left * indexs[0]) + "px -" + (this.top * indexs[1]) + "px";
  }

  installDefaultData(fcDone){
    var dfData:any = {
      vi: {
        Wallet: [
          {name: 'Ví tiền', icon: [8, 9], avail: 1, money: 0, symb: 'VND', oder: 1},
          {name: 'ATM', icon: [8, 6], avail: 1, money: 0, symb: 'VND', oder: 2}, 
          {name: 'Tạm để giành', icon: [0, 11], avail: 0, money: 0, symb: 'VND', oder: 3},
          {name: 'Tiền tiết kiệm', icon: [6, 3], avail: 0, money: 0, symb: 'VND', oder: 4}
        ],
        TypeOthers: [
          { oder: 1, name: 'Received from wallet', icon: [9, 11]},
          { oder: 1, name: 'Transfer to wallet', icon: [6, 10]},
          { oder: 1, name: 'Add new wallet', icon: [0, 10]},
          { oder: 1, name: 'Update wallet', icon: [0, 10]}
        ],
        TypeEarning: [
          { oder: 1, name: 'Lương', icon: [9, 2], 
            inner: [
              { oder: 2, name: 'Thưởng', icon: [7, 9] }
            ] 
          },
          { oder: 3, name: 'Bán hàng', icon: [10, 0] },
          { oder: 4, name: 'Được cho', icon: [6, 11] },
          { oder: 5, name: 'Tiền lãi', icon: [7, 11] },
          { oder: 100, name: 'Khoản thu khác', icon: [1, 4] }
        ],
        TypeSpending: [
          { oder: 1, name: 'Gia đình', icon: [9, 10], 
            inner: [
              { oder: 2, name: 'Con cái', icon: [10, 6] }
            ] 
          },
          { oder: 3, name: 'Điện & nước & internet', icon: [12, 6] },
          { oder: 3, name: 'Ăn uống', icon: [1, 0] },
          { oder: 4, name: 'Bạn bè & người yêu', icon: [0, 0] },
          { oder: 5, name: 'Du lịch', icon: [11, 0] },
          { oder: 7, name: 'Giáo dục', icon: [7, 10] },
          { oder: 8, name: 'Mua sắm', icon: [2, 0] },
          { oder: 9, name: 'Y tế & Sức khoẻ', icon: [2, 11] },
          { oder: 10, name: 'Đi lại', icon: [1, 2] },
          { oder: 10, name: 'Cho vay', icon: [6, 10] },
          { oder: 100, name: 'Khoản chi phí khác', icon: [1, 4] }
        ]
      }, 
      en: {
        Wallet: [
          {name: 'Wallet', icon: [8, 9], avail: 1, money: 0, symb: 'USD', oder: 1},
          {name: 'ATM', icon: [8, 6], avail: 1, money: 0, symb: 'USD', oder: 2}, 
          {name: 'Saving', icon: [6, 3], avail: 0, money: 0, symb: 'USD', oder: 3}
        ],
        TypeOthers: [
          { oder: 1, name: 'Received from wallet', icon: [9, 11]},
          { oder: 1, name: 'Transfer to wallet', icon: [6, 10]},
          { oder: 1, name: 'Add new wallet', icon: [0, 10]},
          { oder: 1, name: 'Update wallet', icon: [0, 10]}
        ],
        TypeEarning: [
          { oder: 1, name: 'Salary', icon: [9, 2], 
            inner: [
              { oder: 2, name: 'Bonus', icon: [7, 9] }
            ] 
          },
          { oder: 3, name: 'Selling', icon: [10, 0] },
          { oder: 4, name: 'Gifts', icon: [6, 11] },
          { oder: 5, name: 'Interest', icon: [7, 11] },
          { oder: 100, name: 'Other Income', icon: [1, 4] }
        ],
        TypeSpending: [
          { oder: 1, name: 'Family', icon: [9, 10], 
            inner: [
              { oder: 2, name: 'Children', icon: [10, 6] }
            ] 
          },
          { oder: 3, name: 'Electric - Water - Internet', icon: [12, 6] },
          { oder: 3, name: 'Food - Beverage', icon: [1, 0] },
          { oder: 4, name: 'Friend - Love', icon: [0, 0] },
          { oder: 5, name: 'Travel', icon: [11, 0] },
          { oder: 7, name: 'Education', icon: [7, 10] },
          { oder: 8, name: 'Shopping', icon: [2, 0] },
          { oder: 9, name: 'Health - Fitness', icon: [2, 11] },
          { oder: 10, name: 'Transportation', icon: [1, 2] },
          { oder: 10, name: 'Loan', icon: [6, 10] },
          { oder: 100, name: 'Other Expendse', icon: [1, 4] }
        ]
      }
    };
    var db = dfData['vi'];
    
    var insertTypeSpending = (type, fcDone) => {
      var query:Array<string> = [];
      var prms:Array<any> = [];
      (type === 0 ? db.TypeOthers : (type === 1 ? db.TypeEarning : db.TypeSpending)).forEach(value => {
        var parentId = Utils.getUID();
        query.push("(?, ?, ?, ?, ?, ?, 0, ?, ?)");
        prms = prms.concat([value.name, this.getIcon(value.icon, false), this.getIcon(value.icon, true), null, type, value.oder, DataProviderService.me.email, parentId]);
        if(value.inner){                  
            value.inner.forEach(value1 => {
              query.push("(?, ?, ?, ?, ?, ?, 0, ?, ?)");
              prms = prms.concat([value1.name, this.getIcon(value1.icon, false), this.getIcon(value1.icon, true), parentId, type, value1.oder, DataProviderService.me.email, Utils.getUID()]);
            });
        }
      });
      this.storage.query("INSERT INTO TypeSpending(name, icon, sicon, parent_id, type, oder, is_sync, email, ID) values " + query.join(','), prms).then(resp => {
        fcDone();
      });  
    }

    var insertWallet = (fcDone) => {
      var query:Array<string> = [];
      var prms:Array<any> = [];

      db.Wallet.forEach(value=>{
        query.push("(?, ?, ?, ?, ?, ?, 0, ?, ?, ?)");
        prms = prms.concat([value.name, this.getIcon(value.icon, false), this.getIcon(value.icon, true), value.avail, value.money, value.symb, DataProviderService.me.email, Utils.getUID(), value.oder]);
      });
      this.storage.query("INSERT INTO Wallet(name, icon, sicon, avail, money, symb, is_sync, email, ID, oder) values " + query.join(','), prms).then(resp => {
        fcDone();
      });
    }

    insertWallet(() => {
      console.log('Inserted wallet');
      insertTypeSpending(0, () => {
        console.log('Inserted type spending 0');
        insertTypeSpending(1, () => {
          console.log('Inserted type spending 1');
          insertTypeSpending(-1, () => {
            console.log('Inserted type spending -1');
            fcDone();
          });
        });
      });
    });

  }

}