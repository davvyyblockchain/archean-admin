import { Injectable } from '@angular/core';
import Web3 from 'web3';

import { HttpHeaders, HttpClient } from '@angular/common/http';

import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { env } from 'process';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable, throwError } from 'rxjs';

declare let window: any;
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  web3: any;

  userAccount: any;
  URL: any = environment.URL;
  private behave = new BehaviorSubject<Object>('');
  setBehaviorView(behave: object) {
    this.behave.next(behave);
  }

  /** Get Behavior for user registraion */
  getBehaviorView(): Observable<object> {
    return this.behave.asObservable();
  }

  constructor(private route: ActivatedRoute, private http: HttpClient, private toaster: ToastrService, private router: Router,) {
    if (window.ethereum) {

      window.web3 = new Web3(window.ethereum);
      this.web3 = new Web3(window.web3.currentProvider);

      // window.web3 = new Web3(Web3.givenProvider);
      // this.web3 = new Web3(Web3.givenProvider);

      // window.web3 = new Web3(window.Web3.givenProvider);

      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length) {
          if (this.userAccount != accounts[0]) {

            if (localStorage.removeItem('Authorization') != null) {

            }
            this.userAccount = accounts[0];
            window.location.reload();
          }

        }
        // window.location.reload();
      });

      window.ethereum.on('chainChanged', function () {
        if (localStorage.removeItem('Authorization') != null) {

        }
        // logout();
        else
          window.location.href = '/';
      });
    }
    // Legacy dapp browsers...
    else if (window.web3) {

      // commented for future use
    }
    // Non-dapp browsers...
    else {
      window.web3 = new Web3(environment.mainnetBSC);
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }

  }

  getNetworkName() {
    if (window.ethereum && window.ethereum.chainId) {

      let obj: any = {};
      console.log(window.ethereum.chainId)
      if (window.ethereum.chainId == "0x1") {
        obj.network_name = environment.main;
      }
      if (window.ethereum.chainId == "0x3") {
        obj.network_name = environment.rops;
      }
      if (window.ethereum.chainId == "0x4") {
        obj.network_name = environment.rinkeby;
      }
      if (window.ethereum.chainId == "0x5") {
        obj.network_name = environment.Goerli;
      }
      if (window.ethereum.chainId == "0x2a") {
        obj.network_name = environment.Kovan;
      }
      if (window.ethereum.chainId == '0x61') {
        obj.network_name = environment.bscTestnet;
      }
      if (window.ethereum.chainId == '0x38') {
        obj.network_name = environment.bscMainnet;
      }
      this.setBehaviorView({ ...this.getBehaviorView(), ...obj });
      return obj.network_name;
    }
  }

  connect() {
    // if (window.ethereum) {
    // commented for future use
    return new Promise((resolve, reject) => {

      let temp = window.ethereum.enable();
      // web3.eth.accounts.create();
      if (temp) {
        resolve(temp)
      } else {
        reject('err');
      }

    })
    // }
  }

  // --dn
  async exportInstance(SCAddress: any, ABI: any) {
    console.log('---------------s---------4', SCAddress);
    console.log('--------------s----------4', ABI);

    let a = await new window.web3.eth.Contract(ABI, SCAddress);
    console.log('------------s------------4', a);
    if (a) {
      return a;
    } else {
      return {};
    }
  }

  // --dn
  async export() {

    let a = await window.ethereum.request({ method: 'eth_requestAccounts' });

    if (window.ethereum) {
      return new Promise(async (resolve, reject) => {

        let accounts: any = await window.ethereum.request({ method: 'eth_requestAccounts' });

        if (accounts && accounts.length) {
          window.web3.eth.defaultAccount = accounts[0];
          let obj: any = {};
          obj.wallet_address = accounts[0];
          this.setBehaviorView({ ...this.getBehaviorView(), ...obj });

          resolve(accounts[0])
        } else {
          resolve([]);
        }
      })
    } else {
      this.toaster.error('No account found! Make sure the Ethereum client is configured properly. ')
    }

  }

  getBalance(contractInstance: any, userWalletAccount: any) {
    return new Promise(async (resolve, reject) => {
      if (!userWalletAccount) {
        console.log('Metamask/Wallet connection failed.');
        this.toaster.error('Metamask/Wallet connection failed.');
        return;
      }
      let result = await contractInstance.methods.balanceOf(userWalletAccount).call({
        from: userWalletAccount
      });

      if (result) {
        result = await Web3.utils.fromWei(`${result}`);
        resolve(result);
      } else {
        reject('err');
      }

    });

  }

  // 
  getHeaders() {
    let t: any = localStorage.getItem('Authorization');
    return t;
  }
  checkuseraddress(address: any) {
    return this.http.post(this.URL + '/auth/checkuseraddress', { sWalletAddress: address });
  }

  getprofile() {
    return this.http.get(this.URL + '/user/profile', { headers: { 'Authorization': this.getHeaders() } });
  }

  updateProfile(data: any) {
    return this.http.put(this.URL + '/user/updateProfile', data, { headers: { 'Authorization': this.getHeaders() } });
  }


  login(type: any, from: any, toaster: any) {
    const that = this;
    if (window.ethereum) {

      const timestamp = new Date().getTime();
      const message = `DecryptNFT uses this cryptographic signature in place of a password, verifying that you are the owner of this Ethereum address - ${timestamp}`;

      console.log(window.web3.utils.fromUtf8(message));

      window.web3.currentProvider.sendAsync({
        method: 'personal_sign',
        params: [message, from],
        from: from,
      }, function (err: any, signature: any) {
        // console.log('---------------------<<M',result);
        // console.log('---------------------<<err',err)
        if (err && err == null || err == undefined) {
          if (signature['result']) {
            if (type == "signin") {
              that.http.post(that.URL + '/auth/login', {
                sWalletAddress: from,
                sMessage: message,
                sSignature: signature['result']
              }).subscribe((result: any) => {
                if (result && result['data']) {

                  localStorage.setItem('Authorization', result.data.token);
                  localStorage.setItem('sWalletAddress', result.data.sWalletAddress);
                  toaster.success('Sign in successfully.');
                  that.onClickRefresh();
                }
              }, (err) => {
                if (err) {
                  toaster.error('There is some issue with sign in');

                }
              });
            }
            if (type == "signup") {
              that.http.post(that.URL + '/auth/register', {
                sWalletAddress: from,
                sMessage: message,
                sSignature: signature['result']
              }).subscribe((result: any) => {
                if (result && result['data']) {
                  toaster.success('Sign up successfully.');

                  localStorage.setItem('Authorization', result.data.token);
                  localStorage.setItem('sWalletAddress', result.data.sWalletAddress);
                  that.onClickRefresh();

                }
              }, (err) => {
                if (err) {
                  toaster.error('There is some issue with sign up');

                }
              });
            }
          }
        } else {
          toaster.error(err['message']);
        }

        // window.web3.eth.personal.sign(message, from, function (err: any, signature: any) {
        // console.log('--------signature-----', signature);
        // console.log('--------err-----', err)

      })
    }
    // return this.http.post(this.URL + '/auth/checkuseraddress', {sWalletAddress:address});
  }


  getCollectionList() {
    return this.http.get(this.URL + '/nft/collectionlist', { headers: { 'Authorization': this.getHeaders() } });
  }

  getCategories() {
    return this.http.get(this.URL + '/user/categories', { headers: { 'Authorization': this.getHeaders() } });
  }

  getColoboraterList() {
    return this.http.get(this.URL + '/user/getCollaboratorList', { headers: { 'Authorization': this.getHeaders() } });
  }

  createCollection(data: any) {
    return this.http.post(this.URL + '/nft/createCollection', data, { headers: { 'Authorization': this.getHeaders() } });
  }
  createCollaborator(data: any) {
    return this.http.post(this.URL + '/user/addCollaborator', data, { headers: { 'Authorization': this.getHeaders() } });
  }


  createNFT(data: any) {
    return this.http.post(this.URL + '/nft/create', data, { headers: { 'Authorization': this.getHeaders() } });
  }

  setTransactionHash(data: any) {
    return this.http.post(this.URL + '/nft/setTransactionHash', data, { headers: { 'Authorization': this.getHeaders() } });
  }

  nftListing(data: any) {
    return this.http.post(this.URL + '/nft/nftListing', data, { headers: { 'Authorization': this.getHeaders() } });
  }
  viewnft(id: any) {
    return this.http.get(this.URL + '/nft/viewnft/'+id, { headers: { 'Authorization': this.getHeaders() } });
  }
  bidHistory(id: any,data:any) {
    return this.http.post(this.URL + '/bid/history/'+id,data, { headers: { 'Authorization': this.getHeaders() } });
  }

  
  landingPage() {
    return this.http.get(this.URL + '/nft/landing', { headers: { 'Authorization': this.getHeaders() } });
  }
  nftMYListing(data: any) {
    return this.http.post(this.URL + '/nft/mynftlist', data, { headers: { 'Authorization': this.getHeaders() } });
  }

  // nft/
  onClickRefresh() {
    window.location.reload();
  }
}
