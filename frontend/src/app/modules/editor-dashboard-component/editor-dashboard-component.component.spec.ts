import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorDashboardComponentComponent } from './editor-dashboard-component.component';

describe('EditorDashboardComponentComponent', () => {
  let component: EditorDashboardComponentComponent;
  let fixture: ComponentFixture<EditorDashboardComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditorDashboardComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorDashboardComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
