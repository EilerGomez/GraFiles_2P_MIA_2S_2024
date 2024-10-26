import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompartidaComponent } from './compartida.component';

describe('CompartidaComponent', () => {
  let component: CompartidaComponent;
  let fixture: ComponentFixture<CompartidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompartidaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompartidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
