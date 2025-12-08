import { Injectable } from '@angular/core';
import { Figurinha } from '../models/figurinha/figurinha';

@Injectable({
  providedIn: 'root',
})
export class Sticker {

  private KEY = 'album_figurinhas';
  private figurinhas: Figurinha[] = [];

  constructor() {
    this.load();
  }

  private load() {
    const data = localStorage.getItem(this.KEY);

    if (data) {
      const parsed: any[] = JSON.parse(data);

      this.figurinhas = parsed.map(f =>
        new Figurinha(f.number, f.has, f.duplicates, f.isPressing ?? false)
      );

    } else {
      this.figurinhas = Array.from({ length: 670 }, (_, i) =>
        new Figurinha(i + 1, false, 0, false)
      );
      this.save();
    }
  }

  private save() {
    localStorage.setItem(this.KEY, JSON.stringify(this.figurinhas));
  }

  getAll(): Figurinha[] {
    return this.figurinhas;
  }

  toggleHas(fig: Figurinha) {
    fig.has = !fig.has;
    if (!fig.has) fig.duplicates = 0;
    this.save();
  }

  addDuplicate(fig: Figurinha) {
    fig.has = true;
    fig.duplicates++;
    this.save();
  }

  removeDuplicate(fig: Figurinha) {
    if (fig.duplicates > 0) {
      fig.duplicates--;
      if (fig.duplicates === 0) fig.has = true;
      this.save();
    }
  }

  resetAll() {

    this.figurinhas = Array.from({ length: 670 }, (_, i) =>
      new Figurinha(i + 1, false, 0, false)
    );
    // this.figurinhas = this.figurinhas.map(f =>
    //   new Figurinha(f.number, false, 0, false)
    // );
    this.save();
  }

  exportJson(): string {
    return JSON.stringify(this.figurinhas);
  }

  importJson(payload: string) {
    const parsed = JSON.parse(payload);

    if (!Array.isArray(parsed)) throw new Error('Formato inválido');

    this.figurinhas = parsed.map(f =>
      new Figurinha(f.number, f.has, f.duplicates, f.isPressing ?? false)
    );

    this.save();
  }
}
