import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  showObj: any = {
    wallet_address: '',
    show: 'metamask',
    network_name: '',
  };

  constructor(private router: Router,
    private _route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private toaster: ToastrService,
    private apiService: ApiService,
  ) {

    // this.id = this._route.snapshot.params['id'];
  }

  async ngOnInit() {
  
  }

  connectToMetaMask() {
    this.spinner.show();
    this.apiService.connect().then((data: any) => {
      this.spinner.hide();
      if(data && data != 'error'){
        this.toaster.success('User Connected Successfully');
        this.onClickRefresh();
      }

    }).catch((er: any) => {
      this.spinner.hide();

      if (er && er.code) {
        this.toaster.error(er.message);
      }
    })
  }


  onClickRefresh() {
    window.location.reload();
  }

}
