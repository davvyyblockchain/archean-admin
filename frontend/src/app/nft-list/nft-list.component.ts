import { Component, OnInit } from '@angular/core';
import { ScriptLoaderService } from '../script-loader.service';

@Component({
  selector: 'app-nft-list',
  templateUrl: './nft-list.component.html',
  styleUrls: ['./nft-list.component.css']
})
export class NFTListComponent implements OnInit {

 
  constructor(private _script: ScriptLoaderService,
    ) { }
  
    ngOnInit(): void {
      let scripts = [];
      scripts = [
        "../../assets/js/jquery-3.5.1.min.js",
        "../../assets/js/bootstrap.bundle.min.js",
        "../../assets/js/owl.carousel.min.js",
        "../../assets/js/jquery.magnific-popup.min.js",
        "../../assets/js/select2.min.js",
        "../../assets/js/smooth-scrollbar.js",
        "../../assets/js/jquery.countdown.min.js",
        "../../assets/js/main.js",
      ];
  
      this._script.loadScripts("app-nft-list", scripts).then(function () {
  
      })
  
  
    }
  

}
