import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LearnplacePage } from './learnplace.page';

describe('LearnplacePage', () => {
  let component: LearnplacePage;
  let fixture: ComponentFixture<LearnplacePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LearnplacePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LearnplacePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
