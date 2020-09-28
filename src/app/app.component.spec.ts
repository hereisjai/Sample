import { TestBed, async, inject } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientTestingModule],        declarations: [
        AppComponent
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'xt-spaceX'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('xt-spaceX');
  });
});
describe('App component srevice testing',()=>{
  let httpTestingController: HttpTestingController;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientTestingModule],        declarations: [
        AppComponent
      ],
    }).compileComponents();
    httpTestingController = TestBed.get(HttpTestingController);
  }));

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should render title', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        app.requestWebservice().subscribe(data=>{
          expect(data).not.toBeNull();
        });
        const req = httpTestingController.expectOne('https://api.spaceXdata.com/v3/launches?limit=100');
        expect(req.request.method).toEqual('GET');
        // Then we set the fake data to be returned by the mock
        req.flush({data: {}});
      }
  );
});
