import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletettaskComponent } from './deletettask.component';

describe('DeletettaskComponent', () => {
  let component: DeletettaskComponent;
  let fixture: ComponentFixture<DeletettaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeletettaskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletettaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
