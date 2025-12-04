import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const credentials = authService.getCredentials();
  
  // Solo agregar header para llamadas a ElevenLabs
  if (req.url.includes('elevenlabs.io') && credentials?.elevenLabsApiKey) {
    const clonedReq = req.clone({
      setHeaders: {
        'xi-api-key': credentials.elevenLabsApiKey
      }
    });
    return next(clonedReq);
  }
  
  return next(req);
};

