export class GeneralUiService {

  backdrop = {
    present: false,
  };

  showBackdrop() {
    this.backdrop.present = true;
  }

  hideBackdrop() {
    this.backdrop.present = false;
  }

}
