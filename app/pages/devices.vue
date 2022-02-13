<template>
  <div>
    <!-- Formulario y agregar nuevo dispositivo-->
    <div class="row">
      <card>
        <div slot="header">
          <h4 class="card-title">Agregar nuevo dispositivo</h4>
        </div>

        <div class="row">
          <div class="col-4">
            <base-input
              label="N. del dispositivo"
              type="text"
              placeholder="Ej: Vivero, Invernadero,"
              v-model="newDevice.name"
            ></base-input>
          </div>

          <div class="col-4" type="success">
            <base-input
              label="ID del dispositivo"
              type="text"
              placeholder="Ej: 00-00-00"
              v-model="newDevice.dId"
            ></base-input>
          </div>

          <div class="col-4">
            <slot name="label">
              <label>Plantillas</label>
            </slot>

            <el-select
              v-model="selectedIndexTemplate"
              placeholder="Selecciona una plantilla"
              class="select-success"
              style="width:100%"
            >
              <el-option v-for="template, index in templates" :key="index"
                class="text-dark"
                :value="index"
                :label="template.name"
              ></el-option>
            </el-select>
          </div>
        </div>
        <div class="row pull-right">
          <div class="col-12">
            <base-button @click="createNewDevice()" type="success" class="mb-3" size="lg"
              >Agregar</base-button
            >
          </div>
        </div>
      </card>
    </div>

    <!-- Tabla de dispositivos-->
    <div class="row">
      <card>
        <div slot="header">
          <h4 class="card-title">Dispositivos</h4>
        </div>

        <el-table :data="$store.state.devices">
          <el-table-column prop="name" label="Nombre"></el-table-column>
          <el-table-column
            prop="dId"
            label="Id del dispositivo"
          ></el-table-column>
          <el-table-column
            prop="templateName"
            label="Plantilla"
          ></el-table-column>

          <el-table-column label="Acciones">
            <div slot-scope="{ row, $index }">
              <el-tooltip style="margin-right:10px">
                <i
                  class="fas fa-database"
                  :class="{
                    'text-success': row.saverRule,
                    'text-dark': !row.saverRule
                  }"
                ></i>
              </el-tooltip>

              <el-tooltip content="Grabar en base de datos">
                <base-switch
                  @click="updateSaverRuleStatus($index)"
                  :value="row.saverRule"
                  type="success"
                  on-text="On"
                  off-text="Off"
                ></base-switch>
              </el-tooltip>

              <el-tooltip
                content="Eliminar"
                effect="light"
                :open-delay="300"
                placement="top"
              >
                <base-button
                  type="danger"
                  icon
                  size="sm"
                  class="btn-link"
                  @click="deleteDevice(row)"
                >
                  <i class="templates"></i>
                </base-button>
              </el-tooltip>
            </div>
          </el-table-column>
        </el-table>
      </card>
    </div>

    <json :value="templates"></json>
  </div>
</template>

<script>
import { Table, TableColumn } from "element-ui";
import { Select, Option } from "element-ui";

export default {
  middleware: "authenticated",
  components: {
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [Option.name]: Option,
    [Select.name]: Select
  },
  data() {
    return {
      templates: [],
      selectedIndexTemplate: null,
      newDevice:{
          name: "",
          dId: "",
          templateId: "",
          templateName: ""
      },
    };
  },
  mounted() {
    this.$store.dispatch("getDevices");
    this.getTemplates()
  },

  methods: {
    async getTemplates() {
      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token
        }
      };
      try {
        const res = await this.$axios.get("/template", axiosHeaders);
        console.log(res.data);
        if (res.data.status == "success") {
          this.templates = res.data.data;
          console.log("Lista de templates", this.templates);
        }
      } catch (error) {
        this.$notify({
          type: "danger",
          icon: "tim-icons icon-alert-circle-exc",
          message: "Error al cargar las plantillas"
        });
        console.log(error);
        return;
      }
    },

    createNewDevice(){
        if(this.newDevice.name == ""){
            this.$notify({
                type: "warning",
                icon: "tim-icons icon-alert-circle-exc",
                message: "Nombre del dispositivo vacio"
            });
             return;
        }
        if(this.newDevice.dId == ""){
            this.$notify({
                type: "warning",
                icon: "tim-icons icon-alert-circle-exc",
                message: "ID del dispositivo vacio"
            });
             return;
        }
        if(this.selectedIndexTemplate == null){
            this.$notify({
                type: "warning",
                icon: "tim-icons icon-alert-circle-exc",
                message: "Deve seleccionar al menos un template"
            });
             return;
        }
        const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token
        }
      };
      //Nombre y ID del template seleccionado
      this.newDevice.templateId = this.templates[this.selectedIndexTemplate]._id;
      this.newDevice.templateName = this.templates[this.selectedIndexTemplate].name;

      const toSend = {
          newDevice: this.newDevice
      }

      this.$axios
        .post("/device", toSend, axiosHeaders)
        .then(res => {
            if (res.data.status == "success"){
                
                this.$store.dispatch("getDevices");

                this.newDevice.name = "";
                this.newDevice.dId = "";
                this.selectedIndexTemplate = null;

                this.$notify({
                    type: "warning",
                    icon: "tim-icons icon-alert-circle-exc",
                    message: "Dispositivo agregado correctamente"
                });
                return
            }
        })
        .catch(e => {
            if (e.response.data.status == "error" && e.response.data.error.errors.dId.kind == "unique"){
                 this.$notify({
                    type: "warning",
                    icon: "tim-icons icon-alert-circle-exc",
                    message: "El dispositivo ya existe"
                });
                return;
            }else{
                this.showNotify("danger","Error");
                return;
            }
        });
    },

    deleteDevice(device) {
      const axiosHeader = {
        headers: {
          token: this.$store.state.auth.token
        },
        params: {
          dId: device.dId
        }
      };
      this.$axios
        .delete("/device", axiosHeader)
        .then(res => {
          if (res.data.status == "success") {
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: device.name + "Borrado"
            });
            this.$store.dispatch("getDevices");
          }
        })
        .catch(e => {
          console.log(e);
          this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
            message: "Error al borrar " + device.name
          });
        });
    },

    updateSaverRuleStatus(index) {
      this.devices[index].saverRule = !this.devices[index].saverRule;
    }
  }
};
</script>
