import { Component, OnInit } from '@angular/core';
import { ScriptLoaderService } from '../script-loader.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

 
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
  
      this._script.loadScripts("app-users", scripts).then(function () {
  
      })
  
  
    }
  

}
