import { AppModule } from './app/app.module';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


const bootstrap = () => platformBrowserDynamic().bootstrapModule(AppModule)

export default bootstrap;
