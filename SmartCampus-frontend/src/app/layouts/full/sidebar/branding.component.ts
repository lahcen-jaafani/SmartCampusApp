import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-branding',
  imports: [],
  template: `
    <a href="/" class="logodark">
      <img src="./assets/images/logos/smart-campus-logo.jpeg"
        alt="logo SmartCampus"
      />
    </a>
  `,
})
export class BrandingComponent {
  options = this.settings.getOptions();
  constructor(private settings: CoreService) {}
}
