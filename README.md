Para inicializar el proyecto de una manera local se deben de configurar las variables de entorno, para este caso se debe de crear un archivo llamado _.env_ en este se deben de crear las siguientes variables:

_PORT_: este corresponde al puerto local donde desea levantar la aplicacion
_DB_HOST_: indicar el tipo de servidor
_DB_USER_: indicar el nombre del usuario de la base de datos
_DB_NAME_: indicar el nombre de la base de datos
_DB_PASS_: indicar la contraseña de la base de datos en caso de que la tenga configurada (tener en cuenta que si agrega la contraseña se debe de configurar en el archivo server.js como varible de entorno)

Seguido de ello ubicarse en la carpeta de backend por medio de una consola ya sea CMD o GIT BASH
Inicializar los modulos de node esto lo hacen con:
_npm install_
Seguido para inicializar el servidor local se digita
_npm run dev_

Luego de ello se debe de ingresar a la carpeta de frontend por medio de una consola ya sea CMD o GIT BASH.
Inicializar los modulos de node esto lo hacen con:
_npm install_
Seguido para inicializar el servidor local se digita
_npm run dev_

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
