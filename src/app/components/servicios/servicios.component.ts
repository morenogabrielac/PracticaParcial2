import { Component, OnInit } from "@angular/core";
import { Articulo } from "../../models/articulo";
import { ArticuloFamilia } from "../../models/articulo-familia";
import { MockArticulosService } from "../../services/mock-articulos.service";
import { MockArticulosFamiliasService } from "../../services/mock-articulos-familias.service";
import { ArticulosService } from "../../services/articulos.service";
import { ArticulosFamiliasService } from "../../services/articulos-familias.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ModalDialogService } from "../../services/modal-dialog.service";
import { ServiciosService } from "../../services/servicios.service";

@Component({
  selector: "app-servicios",
  templateUrl: "./servicios.component.html",
  styleUrls: ["./servicios.component.css"]
})
export class ServiciosComponent implements OnInit {
  Titulo = "Servicios";
  TituloAccionABMC = {
    A: "(Agregar)",
    B: "(Eliminar)",
    M: "(Modificar)",
    C: "(Consultar)",
    L: "(Listado)"
  };
  AccionABMC = "L"; // inicialmente inicia en el listado de articulos (buscar con parametros)
  Mensajes = {
    SD: " No se encontraron registros...",
    RD: " Revisar los datos ingresados..."
  };

  Lista: Articulo[] = [];
  RegistrosTotal: number;
  Familias: ArticuloFamilia[] = [];
  SinBusquedasRealizadas = true;

  Pagina = 1; // inicia pagina 1

  // opciones del combo activo
  OpcionesActivo = [
    { Id: null, Nombre: "" },
    { Id: true, Nombre: "SI" },
    { Id: false, Nombre: "NO" }
  ];

  FormFiltro: FormGroup;
  FormReg: FormGroup;
  submitted = false;

  constructor(
    public formBuilder: FormBuilder,
    //private articulosService: MockArticulosService,
    private servicioService: ServiciosService,
    private articulosFamiliasService: MockArticulosFamiliasService,
    //private articulosService: ArticulosService,
    //private articulosFamiliasService: ArticulosFamiliasService,
    private modalDialogService: ModalDialogService
  ) {}

  ngOnInit() {
    this.FormFiltro = this.formBuilder.group({
      Nombre: [""],
      Activo: [null]
    });
    this.FormReg = this.formBuilder.group({
      idservicio: [0],
      descripcion: [
        "",
        [Validators.required, Validators.minLength(5), Validators.maxLength(30)]
      ],
      importe: [null, [Validators.required, Validators.pattern("[0-9]{1,6}")]],
      cantidadhoras: [
        null,
        [Validators.required, Validators.pattern("[0-9]{1,7}")]
      ]
    });

    this.GetFamiliasArticulos();
  }

  GetFamiliasArticulos() {
    this.articulosFamiliasService.get().subscribe((res: ArticuloFamilia[]) => {
      this.Familias = res;
    });
  }

  Agregar() {
    this.AccionABMC = "A";
    this.FormReg.reset();
    this.submitted = false;
    //this.FormReg.markAsPristine();
    this.FormReg.markAsUntouched();
  }

  // Buscar segun los filtros, establecidos en FormReg
  Buscar() {
    this.SinBusquedasRealizadas = false;
    this.servicioService.get().subscribe((res: any) => {
      this.Lista = res.Lista;
      this.RegistrosTotal = res.RegistrosTotal;
    });
  }

  // Obtengo un registro especifico según el Id
  // BuscarPorId(Dto, AccionABMC) {
  //   window.scroll(0, 0); // ir al incio del scroll

  //   this.articulosService.getById(Dto.IdArticulo).subscribe((res: any) => {
  //     this.FormReg.patchValue(res);

  //     //formatear fecha de  ISO 8061 a string dd/MM/yyyy
  //     var arrFecha = res.FechaAlta.substr(0, 10).split("-");
  //     this.FormReg.controls.FechaAlta.patchValue(
  //       arrFecha[2] + "/" + arrFecha[1] + "/" + arrFecha[0]
  //     );

  //     this.AccionABMC = AccionABMC;
  //   });
  // }

  // Consultar(Dto) {
  //   this.BuscarPorId(Dto, "C");
  // }

  // comienza la modificacion, luego la confirma con el metodo Grabar
  // Modificar(Dto) {
  //   if (!Dto.Activo) {
  //     this.modalDialogService.Alert(
  //       "No puede modificarse un registro Inactivo."
  //     );
  //     return;
  //   }
  //   this.submitted = false;
  //   this.FormReg.markAsPristine();
  //   this.FormReg.markAsUntouched();
  //   this.BuscarPorId(Dto, "M");
  // }

  // grabar tanto altas como modificaciones
  Grabar() {
    this.submitted = true;
    // verificar que los validadores esten OK
    if (this.FormReg.invalid) {
      return;
    }

    //hacemos una copia de los datos del formulario, para modificar la fecha y luego enviarlo al servidor
    const itemCopy = { ...this.FormReg.value };

    //convertir fecha de string dd/MM/yyyy a ISO para que la entienda webapi
    // var arrFecha = itemCopy.FechaAlta.substr(0, 10).split("/");
    // if (arrFecha.length == 3)
    //   itemCopy.FechaAlta = new Date(
    //     arrFecha[2],
    //     arrFecha[1] - 1,
    //     arrFecha[0]
    //   ).toISOString();

    // agregar post
    if (itemCopy.idservicio == 0 || itemCopy.idservicio == null) {
      itemCopy.idservicio = 0;
      this.servicioService.post(itemCopy).subscribe((res: any) => {
        this.Volver();
        this.modalDialogService.Alert("Registro agregado correctamente.");
        this.Buscar();
      });
    } else {
      // modificar put
      // this.servicioService
      //   .put(itemCopy.IdArticulo, itemCopy)
      //   .subscribe((res: any) => {
      //     this.Volver();
      //     this.modalDialogService.Alert("Registro modificado correctamente.");
      //     this.Buscar();
      //   });
    }
  }

  // representa la baja logica
  // ActivarDesactivar(Dto) {
  //   this.modalDialogService.Confirm(
  //     "Esta seguro de " +
  //       (Dto.Activo ? "desactivar" : "activar") +
  //       " este registro?",
  //     undefined,
  //     undefined,
  //     undefined,
  //     () =>
  //       this.articulosService
  //         .delete(Dto.IdArticulo)
  //         .subscribe((res: any) => this.Buscar()),
  //     null
  //   );
  // }

  // Volver desde Agregar/Modificar
  Volver() {
    this.AccionABMC = "L";
  }

  ImprimirListado() {
    this.modalDialogService.Alert("Sin desarrollar...");
  }

  // GetArticuloFamiliaNombre(Id) {
  //   var ArticuloFamilia = this.Familias.filter(
  //     x => x.IdArticuloFamilia === Id
  //   )[0];
  //   if (ArticuloFamilia) return ArticuloFamilia.Nombre;
  //   else return "";
  // }
}
