import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerdashboardComponent } from './viewerdashboard.component';

describe('ViewerdashboardComponent', () => {
  let component: ViewerdashboardComponent;
  let fixture: ComponentFixture<ViewerdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewerdashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewerdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
