export default function({store, redirect}){
    //Llamamos a una accion de la store con dispatch
    store.dispatch("readToken");

    if(!store.state.auth){
        return redirect("/login");
    }
}