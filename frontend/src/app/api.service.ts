import { Injectable } from '@angular/core';
import Web3 from 'web3';

import { HttpHeaders, HttpClient } from '@angular/common/http';

import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { env } from 'process';
import { map } from 'rxjs/operators';

declare let window: any;
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  userAccount: any;
  URL: any = environment.URL;

  constructor(private route: ActivatedRoute, private http: HttpClient, private toaster: ToastrService, private router: Router,) {

    if (window.ethereum) {

      window.web3 = new Web3(Web3.givenProvider);
      // window.web3 = new Web3(window.Web3.givenProvider);

      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length) {
          if (this.userAccount != accounts[0]) {

            this.userAccount = accounts[0];
            window.location.reload();
          }

        }
        // window.location.reload();
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
    // if (window.ethereum && window.ethereum.chainId) {
    return window.ethereum.chainId;
    // console.log(window.ethereum.chainId)
    // if (window.ethereum.chainId == "0x1") {
    //   return environment.main;
    // }
    // if (window.ethereum.chainId == "0x3") {
    //   return environment.rops;
    // }
    // if (window.ethereum.chainId == "0x4") {
    //   return environment.rinkeby;
    // }
    // if (window.ethereum.chainId == "0x5") {
    //   return environment.Goerli;
    // }
    // if (window.ethereum.chainId == "0x2a") {
    //   return environment.Kovan;
    // }
    // if (window.ethereum.chainId == '0x61') {
    //   return environment.bscTestnet;
    // }
    // if (window.ethereum.chainId == '0x38') {
    //   return environment.bscMainnet;
    // }


    // }
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
    return await new window.web3.eth.Contract(ABI, SCAddress);
  }

  // --dn
  async export() {
    if (window.web3) {
      return new Promise((resolve, reject) => {
        window.web3.eth.getAccounts((error: any, result: any) => {

          // just 1 min jo
          if (error != null) {
            resolve([]);
          }

          if (result == undefined || result.length == 0) {
            // alert("No account found! Make sure the Ethereum client is configured properly.");
            resolve([]);
          } else {

            let account = result[0];

            window.web3.eth.defaultAccount = account;

            resolve(account)
          }
        })
      })
    } else {
      // this.toaster.error('No account found! Make sure the Ethereum client is configured properly. ')
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
}
