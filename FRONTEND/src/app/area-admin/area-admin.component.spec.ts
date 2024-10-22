import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaAdminComponent } from './area-admin.component';

describe('AreaAdminComponent', () => {
  let component: AreaAdminComponent;
  let fixture: ComponentFixture<AreaAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AreaAdminComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AreaAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
