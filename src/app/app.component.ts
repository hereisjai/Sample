import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';

interface SpaceData {
  mission_id: Array<string>;
  launch_year: string;
  launch_success: string;
  land_success: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})



export class AppComponent implements OnInit {
  title = 'xt-spaceX';
  data: any;
  years: Array<any> = [];
  displayData: any;
  activeIndex: number;
  activeLaunch: number;
  activeLanding: number;
  filters: any = {
    launch_success: '',
    land_success: '',
    year: ''
  };
  constructor(private http: HttpClient) {

  }

  ngOnInit() {
    const makeService = this.requestWebservice('all');
    makeService.subscribe((dat: Array<any>) => {
      this.parseResponse(dat);
    });
  }

  parseResponse(dat) {
    this.data = dat.map(a => {
      this.years.push(a.launch_year);
      let  launch_success = a.launch_success != null ? a.launch_success.toString() : a.launch_success;
      let land_success = a.rocket.first_stage.cores[0].land_success;
      land_success = land_success != null ? land_success.toString() :land_success;
      let obj: SpaceData ={
        mission_id : a.mission_id,
        launch_year : a.launch_year,
        land_success:land_success,
        launch_success: launch_success
      };
      return obj;
    });
    this.displayData = this.data;
    this.displayData = this.displayData.filter(a => {
      return (!this.filters.launch_success || a.launch_success === this.filters.launch_success) &&
        (!this.filters.land_success || a.land_success === this.filters.land_success) &&
        (!this.filters.year || a.launch_year === this.filters.year);
    });
    this.years = this.years.filter((a, i, arr) => arr.indexOf(a) === i);
  }

  callApi() {
    this.requestWebservice().subscribe((dat: Array<any>) => {
      this.parseResponse(dat);
    });
  }

  filterByYear(year: string, index: number) {
    this.activeIndex = index;
    this.filters.year = year;
    this.callApi();
  }

  filterByLaunch(launch: string, index: number) {
    this.activeLaunch = index;
    this.filters.launch_success = launch.toString();
    this.callApi();

  }

  filterByLand(land: string, index: number) {
    this.activeLanding = index;
    this.filters.land_success = land.toString();
    this.callApi();
    // this.displayData = this.displayData.filter(dat=> dat.land_success?dat.land_success.toString()== launch:false)
  }


  requestWebservice(filter?: string, flag?) {
    let url = 'https://api.spaceXdata.com/v3/launches?limit=100';
    let qp = '&';
    for (const key in this.filters) {
      if (this.filters[key]) {
        qp += key + '=' + this.filters[key] + '&';
      }
    }
    url = url + qp;
    return this.http.get(url).pipe(take(1));
  }
}
