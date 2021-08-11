import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private router: Router,
    private _route: ActivatedRoute,
    private toaster: ToastrService,
    private apiService: ApiService,
  ) {

    // this.id = this._route.snapshot.params['id'];
  }

  ngOnInit() {
  }

  connectToMetaMask() {
   
    this.apiService.connect().then((data:any) => {
      this.toaster.success('User Connected Successfully');
      // if (this.router.url) {
        // this.router.navigate(['/' +this.router.url.split('/')[0] +'/'+ this.router.url.split('/')[1] ]).then(() => {
        //   this.onClickRefresh();
        // });
      // }

    }).catch((er:any) => {

      if (er && er.code) {
        this.toaster.error(er.message);
      }
    })
  }

}
