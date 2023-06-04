import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ScriptLoaderService {
  loadScript(url: string, scriptId: string) {
    return new Promise((resolve, reject) => {
      // Remove the old script tag if it exists
      let oldScriptElement = document.getElementById(scriptId);
      if (oldScriptElement) {
        oldScriptElement.remove();
      }

      // Create a new script tag
      const scriptElement = document.createElement('script');
      scriptElement.id = scriptId;
      scriptElement.src = url;

      scriptElement.onload = resolve;
      scriptElement.onerror = reject;

      document.head.appendChild(scriptElement);
    });
  }
}
