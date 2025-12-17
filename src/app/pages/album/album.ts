import {Component, ChangeDetectorRef, ElementRef, ViewChild} from '@angular/core';
import {Figurinha} from '../../models/figurinha/figurinha';
import {Sticker} from '../../services/sticker';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-album',
  imports: [
    NgIf,
    NgForOf,
    FormsModule
  ],
  templateUrl: './album.html',
  styleUrl: './album.scss',
})
export class Album {
  isActionsModalOpen: boolean = false;
  isActionsModalOpen2: boolean = false;
  FILE_NAME_STORAGE_KEY = 'album_file_name';
  figurinhas: Figurinha[] = [];
  lastClick = 0;
  holdTimeout: any;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  numberOnly: boolean = false;
  fileName: string = 'marque uma figurinha e exporte';

  textOrNumberOnly() {
    this.numberOnly = !this.numberOnly;
  }

  teams = [
    {name: 'Alemanha', start: 380, end: 399},
    {name: 'Arábia Saudita', start: 200, end: 219},
    {name: 'Argentina', start: 180, end: 199},
    {name: 'Austrália', start: 280, end: 299},
    {name: 'Bélgica', start: 420, end: 439},
    {name: 'Brasil', start: 520, end: 539},
    {name: 'Camarões', start: 560, end: 579},
    {name: 'Canadá', start: 440, end: 459},
    {name: 'Catar', start: 40, end: 59},
    {name: 'Coreia do Sul', start: 640, end: 659},
    {name: 'Costa Rica', start: 360, end: 379},
    {name: 'Croácia', start: 480, end: 499},
    {name: 'Dinamarca', start: 300, end: 319},
    {name: 'Equador', start: 60, end: 79},
    {name: 'Especiais/Estádios', start: 1, end: 39},
    {name: 'Espanha', start: 340, end: 359},
    {name: 'EUA', start: 160, end: 179},
    {name: 'França', start: 260, end: 279},
    {name: 'Gana', start: 600, end: 619},
    {name: 'Holanda', start: 100, end: 119},
    {name: 'Inglaterra', start: 120, end: 139},
    {name: 'Irã', start: 140, end: 159},
    {name: 'Japão', start: 400, end: 419},
    {name: 'Marrocos', start: 460, end: 479},
    {name: 'México', start: 220, end: 239},
    {name: 'Momentos Finais', start: 660, end: 670},
    {name: 'Polônia', start: 240, end: 259},
    {name: 'Portugal', start: 580, end: 599},
    {name: 'Senegal', start: 80, end: 99},
    {name: 'Sérvia', start: 500, end: 519},
    {name: 'Suíça', start: 540, end: 559},
    {name: 'Tunísia', start: 320, end: 339},
    {name: 'Uruguai', start: 620, end: 639}
  ];

  selectedTeamIndex = 0;
  totalStickers: number = 670;

  constructor(private stickerService: Sticker, private cdr: ChangeDetectorRef) {
    this.figurinhas = this.stickerService.getAll();

    const savedFileName = localStorage.getItem(this.FILE_NAME_STORAGE_KEY);
    if (savedFileName) {
      this.fileName = savedFileName;
    }
  }

  search(query: string) {
    if (!query) return;

    const queryLowerCase = query.toLowerCase().trim();
    let foundElementId: string | null = null;
    let foundTeamIndex: number = -1; // Para armazenar o índice do time

    // 1. Tentar buscar por NÚMERO (Figurinha)
    const figNumber = parseInt(queryLowerCase);
    if (!isNaN(figNumber) && figNumber >= 1 && figNumber <= 670) {

      // A. Encontrar a SELEÇÃO à qual a figurinha pertence
      foundTeamIndex = this.teams.findIndex(team =>
        figNumber >= team.start && figNumber <= team.end
      );

      if (foundTeamIndex !== -1) {
        this.selectedTeamIndex = foundTeamIndex; // Seleciona o Tab

        // B. Definir o ID da figurinha para o foco final
        foundElementId = `fig-${figNumber}`;
      }
    }

    // 2. Tentar buscar por NOME DA SELEÇÃO (Time)
    if (foundElementId === null) {
      foundTeamIndex = this.teams.findIndex(team =>
        team.name.toLowerCase().includes(queryLowerCase)
      );

      if (foundTeamIndex !== -1) {
        this.selectedTeamIndex = foundTeamIndex;
        // Define o ID do botão de seleção (tab) para foco
        foundElementId = `team-${foundTeamIndex}`;
      }
    }

    // AÇÃO FINAL: Rolar a tela para o elemento encontrado
    if (foundTeamIndex !== -1) {
      const teamElementId = `team-${foundTeamIndex}`;

      // 1º Passo de Rolagem: Rola a aba (tab) para a vista (se estiver escondida)
      this.scrollToElement(teamElementId);

      // 2º Passo de Rolagem: Se a busca foi por figurinha, rola para a figurinha após um pequeno delay
      if (figNumber) {
        // O delay é necessário para dar tempo ao Angular de renderizar o novo conteúdo do time
        // e para o scroll do tab terminar.
        setTimeout(() => {
          if (foundElementId) {
            this.scrollToElement(foundElementId);
          }
        }, 300);
      } else if (foundElementId) {
        // Se a busca foi por nome, rola imediatamente para o botão do time
        this.scrollToElement(foundElementId);
      }

      // Limpa o input após a busca bem-sucedida
      this.searchInput.nativeElement.value = "";

    } else if (!foundElementId) {
      // Se nada for encontrado
      alert(`Figurinha ou seleção "${query}" não encontrada.`);
    }
  }

  selectText(event: Event) {
    // Casting de tipo para garantir que o target seja um elemento de input
    const input = event.target as HTMLInputElement;

    // O método select() faz o highlight de todo o texto
    if (input && input.select) {
      input.select();
    }
  }

  getRange(start: number, end: number) {
    return this.figurinhas.slice(start - 1, end);
  }

  selectTeam(i: number) {
    this.selectedTeamIndex = i;
  }

  // DUPLO CLIQUE DETECTION
  onClick(fig: Figurinha) {
    const now = Date.now();
    if (now - this.lastClick < 300) {
      this.doubleClick(fig);
    }
    this.lastClick = now;
    this.searchInput.nativeElement.value = "";
  }

  doubleClick(fig: Figurinha) {
    if (fig.duplicates) return;
    if (fig.has && fig.duplicates === 0) {
      const confirmDesmarcar = confirm("Deseja desmarcar esta figurinha?");
      if (confirmDesmarcar) {
        this.stickerService.toggleHas(fig);
        this.cdr.detectChanges();
      }
    } else {
      this.stickerService.toggleHas(fig);
      this.cdr.detectChanges();
    }

    // ✨ SOLUÇÃO MAIS SIMPLES: Recarrega a referência do array
    // Isso força o Angular a reavaliar o *ngFor
    this.figurinhas = this.stickerService.getAll();
  }

// ... E adicione esta linha nos outros métodos que alteram o estado:
  press(fig: Figurinha) {
    if (!fig.has) return;
    fig.isPressing = true;
    this.holdTimeout = setTimeout(() => {
      this.stickerService.addDuplicate(fig);
      fig.isPressing = false;
      this.figurinhas = this.stickerService.getAll(); // ✨ Adicionar aqui
    }, 500);
  }

  release(fig: Figurinha) {
    clearTimeout(this.holdTimeout);
    fig.isPressing = false;
    // Não precisa recarregar aqui, a menos que o press tenha disparado
  }

  reduzir(fig: Figurinha, event: Event) {
    event.stopPropagation();
    this.stickerService.removeDuplicate(fig);
    this.figurinhas = this.stickerService.getAll(); // ✨ Adicionar aqui
  }

  exportData() {
    // 1. Solicita o nome do arquivo ao usuário
    // Oferece um nome padrão (default) para facilitar a vida do usuário.
    const defaultFileName = 'meu ábum 1';
    const fileName = prompt('Por favor, digite o nome do arquivo de exportação (Exemplo: meu album 1 ):', defaultFileName);

    // 2. Verifica se o usuário cancelou a ação ou não digitou nada
    if (!fileName) {
      // Ação cancelada ou nome vazio, interrompe a função.
      return;
    }

    const json = this.stickerService.exportJson();
    const blob = new Blob([json], {type: 'application/json'});
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;

    // 3. Usa o nome fornecido pelo usuário, garantindo a extensão .json
    const finalFileName = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
    a.download = finalFileName;
// Nome original do arquivo (Ex: meu_album.json)
    const originalName = finalFileName;

    // 1. LIMPAR O NOME: Remove a extensão ".json" (ou ".JSON")
    let baseName = originalName.replace(/\.json$/i, '');
    // O modificador 'i' torna a busca case-insensitive (.json ou .JSON)
    // O '$' garante que a substituição ocorra apenas no final da string.

    // 2. Armazena o nome LIMPO na variável de classe e no localStorage
    this.fileName = baseName;
    localStorage.setItem(this.FILE_NAME_STORAGE_KEY, baseName);

    // // 1. Armazena o nome na variável de classe
    // this.fileName = finalFileName;
    //
    // // 2. PERSISTE: Salva o nome no localStorage
    // localStorage.setItem(this.FILE_NAME_STORAGE_KEY, finalFileName);
    a.click();

    // Limpeza
    URL.revokeObjectURL(url);
  }

  importData(event: any) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    // Nome original do arquivo (Ex: meu_album.json)
    const originalName = file.name;

    // 1. LIMPAR O NOME: Remove a extensão ".json" (ou ".JSON")
    let baseName = originalName.replace(/\.json$/i, '');
    // O modificador 'i' torna a busca case-insensitive (.json ou .JSON)
    // O '$' garante que a substituição ocorra apenas no final da string.

    // 2. Armazena o nome LIMPO na variável de classe e no localStorage
    this.fileName = baseName;
    localStorage.setItem(this.FILE_NAME_STORAGE_KEY, baseName);

    // // 1. Armazena o nome na variável de classe
    // this.fileName = file.name;
    //
    // // 2. PERSISTE: Salva o nome no localStorage
    // localStorage.setItem(this.FILE_NAME_STORAGE_KEY, file.name);

    const reader = new FileReader();
    // ... restante da lógica de importação
    reader.onload = () => {
      try {
        this.stickerService.importJson(reader.result as string);
        this.figurinhas = this.stickerService.getAll();
        alert('Importado com sucesso');
      } catch (e) {
        alert('Falha ao importar: ' + e);
      }
    };
    reader.readAsText(file);
  }

  // importData(event: any) {
  //   const file = event.target.files && event.target.files[0];
  //   if (!file) return;
  //   this.fileName = file.name;
  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     try {
  //       this.stickerService.importJson(reader.result as string);
  //       this.figurinhas = this.stickerService.getAll();
  //       alert('Importado com sucesso');
  //     } catch (e) {
  //       alert('Falha ao importar: ' + e);
  //     }
  //   };
  //   reader.readAsText(file);
  // }

  get isEmptyAlbum(): boolean {
    return this.missingStickersCount === this.totalStickers;
  }

  resetAll() {
    if (confirm('Isso removerá todas as figurinhas do álbum')) {
      if (confirm("Você tem certeza disso?")) {
        this.stickerService.resetAll();
        this.figurinhas = this.stickerService.getAll();
        // 1. Armazena o nome na variável de classe
        this.fileName = "marque uma figurinha e exporte";

        // 2. PERSISTE: Salva o nome no localStorage
        localStorage.setItem(this.FILE_NAME_STORAGE_KEY, this.fileName);
      }
    }
  }

// Método para calcular o total de figurinhas que você já possui
  calculateTotalHas(): number {
    return this.figurinhas.filter(fig => fig.has).length;
  }

// Método para obter as figurinhas que faltam
  calculateMissingStickers(): number {
    const TOTAL_STICKERS = 670;

    // 1. Conta quantas figurinhas você tem (fig.has = true)
    const totalHas = this.calculateTotalHas();

    // 2. Calcula as que faltam
    return TOTAL_STICKERS - totalHas;
  }

// ...
  // Adicione uma propriedade para exibir no HTML
  get missingStickersCount(): number {
    return this.calculateMissingStickers();
  }


  scrollToElement(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      // Usa scrollIntoView para rolar suavemente até o elemento.
      // 'block: center' tenta centralizar o elemento na tela, se possível.
      element.scrollIntoView({behavior: 'smooth', block: 'center'});

      // Opcional: Adiciona um foco visual temporário (ver CSS abaixo)
      this.highlightElement(element);
    } else {
      console.warn(`Elemento com ID "${elementId}" não encontrado. Não é possível rolar.`);
    }
  }

  // Opcional: Para dar um feedback visual (highlight)
  highlightElement(element: HTMLElement): void {
    // Esta lógica assume que você tem uma classe CSS '.highlight-search'
    element.classList.add('highlight-search');
    setTimeout(() => {
      element.classList.remove('highlight-search');
    }, 1500);
  }

  protected readonly console = console;

  // ... dentro da classe Album {...

  // Nova propriedade para controlar a exibição do modal
  showHasModal: boolean = false;

  // para agrupar as figurinhas que o usuário TEM, por time
  getHasStickersGrouped(): { teamName: string, stickers: Figurinha[] }[] {
    const hasStickers = this.figurinhas.filter(fig => fig.has);

    // Mapeia o resultado final
    const groupedHas: { teamName: string, stickers: Figurinha[] }[] = [];

    this.teams.forEach(team => {
      // Filtra as figurinhas 'has' que estão no range deste time
      const teamStickers = hasStickers.filter(fig =>
        fig.number >= team.start && fig.number <= team.end
      );

      // Só adiciona ao agrupamento se o time tiver figurinhas
      if (teamStickers.length > 0) {
        groupedHas.push({
          teamName: team.name,
          stickers: teamStickers
        });
      }
    });

    return groupedHas;
  }

  // Métodos para abrir e fechar o modal
  // openHasModal() {
  //   this.showHasModal = true;
  // }
  //
  // closeHasModal() {
  //   this.showHasModal = false;
  // }

  // Formata a lista de figurinhas em uma string
  formatStickers(stickers: Figurinha[]): string {
    // Usa a lógica de map e join no TypeScript, onde é permitido
    return stickers.map(fig => fig.number).join(', ');
  }

  // ... dentro da classe Album {

  // NOVA PROPRIEDADE: Controla a exibição do modal de Repetidas
  showDupModal: boolean = false;

  // Calcula o total de figurinhas repetidas
  calculateTotalDuplicates(): number {
    // Reduz todos os contadores de 'duplicates' em um único número
    return this.figurinhas.reduce((total, fig) => total + fig.duplicates, 0);
  }

  // Abre e fecha o modal de Repetidas
  openDupModal() {
    this.showDupModal = true;
  }

  closeDupModal() {
    this.showDupModal = false;
  }

  // Obtém as figurinhas REPETIDAS agrupadas por time
  getDupStickersGrouped(): { teamName: string, stickers: Figurinha[] }[] {
    // Filtra apenas as figurinhas que têm mais de 0 repetições
    const dupStickers = this.figurinhas.filter(fig => fig.duplicates > 0);

    const groupedDup: { teamName: string, stickers: Figurinha[] }[] = [];

    this.teams.forEach(team => {
      const teamStickers = dupStickers.filter(fig =>
        fig.number >= team.start && fig.number <= team.end
      );

      if (teamStickers.length > 0) {
        groupedDup.push({
          teamName: team.name,
          stickers: teamStickers
        });
      }
    });

    return groupedDup;
  }

  //Formata a lista de figurinhas repetidas para inclusão da contagem (Ex: 12 (2), 15 (1))
  formatDuplicateStickers(stickers: Figurinha[]): string {
    return stickers
      .map(fig => {
        // Inclui a contagem de duplicates em parênteses
        return `${fig.number} (${fig.duplicates})`;
      })
      .join(', ');
  }

  openHasModal() {
    this.isActionsModalOpen2 = true;
    document.body.classList.add('modal-open');
  }

  closeHasModal() {
    this.isActionsModalOpen2 = false;
    document.body.classList.remove('modal-open');
  }

  // Pegamos a referência da div .tabs
  @ViewChild('tabsContainer') tabsContainer!: ElementRef;

  isMouseDown = false;
  startX: number = 0;
  scrollLeft: number = 0;

  startDragging(e: MouseEvent) {
    this.isMouseDown = true;
    const container = this.tabsContainer.nativeElement;
    // Ponto inicial do clique menos o deslocamento do container
    this.startX = e.pageX - container.offsetLeft;
    this.scrollLeft = container.scrollLeft;
  }

  stopDragging() {
    this.isMouseDown = false;
  }

  moveEvent(e: MouseEvent) {
    if (!this.isMouseDown) return;
    e.preventDefault();

    const container = this.tabsContainer.nativeElement;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - this.startX) * 2; // Multiplicador de velocidade
    container.scrollLeft = this.scrollLeft - walk;
  }


}
