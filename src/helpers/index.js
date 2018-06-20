
'use strict';
import env from "dotenv";
env.config();
// this is the getKey function that generates an encryption Key for you by passing your Secret Key as a parameter.
function transfrormObj(obj) {
  var indexed_array = {};
  var normal_array = {};
  var account_array = {};
  var location_array = {};
  
  indexed_array.email = obj.email;
  indexed_array.last = obj.last;
  indexed_array.name = obj.first + " " + obj.last;
  indexed_array.tel = obj.tel;
  normal_array.typeofaccount= obj.type
  indexed_array.first = obj.first;
  indexed_array.driver_info = normal_array;
  normal_array.last_location = {
              lat: 6.601838,
              lng: 3.351486
          }
  normal_array.recipient = obj.recipient
  normal_array.driver_license_number = obj.driver_license_number
  normal_array.flat_number = obj.flat_number
  normal_array.profile_image = obj.profile_image
  normal_array.driver_licence = obj.driver_licence
  normal_array.building_number = obj.building_number
  normal_array.building_name = obj.building_name
  normal_array.street = obj.street
  normal_array.sub_street = obj.sub_street
  normal_array.landmark = obj.landmark
  normal_array.post_code = obj.post_code
  normal_array.town = obj.town
  normal_array.state = obj.state
  normal_array.account_info = account_array
  account_array.account_info = obj.account_number
  account_array.bank = obj.bank_name
  account_array.bank_code = obj.bank_code
  account_array.bvn = obj.bvn
  normal_array.active= true
  normal_array.busy= false
  normal_array.verified= false
  normal_array.uverifyStatus= false
  normal_array.rating= 3
  normal_array.type= obj.type_of_car
  
  
  return indexed_array;
    
  }
  
  function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }

  function removeSpace(str) {
    str = str.replace(/\s+/g, '-')
    return str;
  }
   
// export default {
//   transfrormObj,
//   removeSpace,
//   makeid,
// }
module.exports = {  
  transfrormObj,
  removeSpace,
  makeid
}