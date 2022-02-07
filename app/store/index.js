export const state = () => ({
    auth: null,
    devices: [],
});

//La mutacion es solo cambiarle el valor a un state 
export const mutations = {
    setAuth(state, auth){
        state.auth = auth
    },
    setDevices(state,devices){
        state.devices = devices;
    }
};

export const actions = {
    readToken(){
        let auth = null;
        try {
            auth = JSON.parse(localStorage.getItem('auth'));   
        } catch (error) {
            console.log(err);
        }

        //Saving auth in state
        this.commit('setAuth', auth) 
    } ,

    getDevices(){
        const axiosHeader = {
            headers: {
                token: this.state.auth.token
            }
        };
    
        this.$axios.get("/device", axiosHeader)
        .then(res => {
            console.log("Respuesta",res.data.data)
            this.commit("setDevices", res.data.data )
        });
    },
}