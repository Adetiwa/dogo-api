'use strict'

import model from './../../model'
import request from "request"
import notification from "./../notification";
class Trip
{
    constructor() {
        this.tripMinute = 0
        this.trip = null
        this.createdTime = null
        this.cost = 0
        this.historyId = null
    }

    /**
     * 
     */
   async getFareCost(history) {
        this.historyId = history._id

        var n = new Date().getHours();
        let night = 0;
        let hours = 0;
        let minutes = this.getMinute(history.date)
        let one_way = 0;
        
        if (n > 18 || n < 6) {
          night = 1;
        }

        if (minutes >= 180) {
          hours = 1;
        }


        if (history.type == 'one_way') {
            one_way = 1;
        } else {
            one_way = 0;
        }
        let cost = await this.processCost(one_way, night, hours, minutes);
        if(history.voucher) {
            cost = cost - history.voucher;
            if (cost < 0) {
                cost = 0;
            }
            
        }
        this.cost = cost
        
        return cost
    }
   
    async processCost(one_way, night, hours, minutes) {
        let history = this.trip
        try{
            let fare = await model.fare.findOne({type: history.type})
            var cost = 0;
            if (fare != null) {
                if (hours != 1) {
                    cost = Math.ceil(parseFloat(hours * fare.first_3_hours));
                } else {
                    cost = Math.ceil(parseFloat(hours * fare.first_3_hours) + parseFloat(fare.per_min * (minutes - 180)) + parseFloat(one_way * fare.one_way_charge) + parseFloat(night * fare.night_charge)); 
                }
                this.cost = cost
                return cost
            } 
            
            return cost
        } catch(Error) {
            if(Error) {
                throw Error
            }
        }
    }


    /**
     * get the history minute
     * @param {*} createdTime 
     */
    getMinute(createdTime) {
        let currentTime =  new Date()
        let newdate = new Date(createdTime)
        let minutes = ((currentTime - newdate)/60000);

        this.minutes = minutes

        return minutes
    }

    async getDriverHistories (driverId) {
        let driverHistries = await model.history.find({driver: driverId})

        return driverHistries
    }

    async processFareRequest(id, status, driver_status, token) {

        let history = await this.getTripById(id);
        
        let cost = await this.getFareCost(history);
        
        if ((driver_status == 'completed') && (history.payment_method == 'CARD')) {
            return new Promise((resolve, reject) => {
             request.post({
                url: 'https://api.paystack.co/transaction/charge_authorization',
                headers : {
                "Authorization" : "Bearer "+token
                },
                json: { 
                    authorization_code: history.card, 
                    email: history.email,
                    amount: this.cost * 100
                    
                }
            }, function(error, response, body){
                console.log(`Stage 1 {body.status}`);
                
            if(body.status) {
                if (response.body.data.status === "success") {
                history.payment_status = "completed";
                history.driver_status = "completed";
                history.status = "completed";
                history.cost = cost;
                history.date_finished = Date.now();

                } else {
                    history.payment_status = null;
                    history.driver_status = "completed";
                    history.cost = cost;
                }
            } else {
                // return body.message
                history.payment_status = null;
                history.driver_status = "completed";
                history.status = "completed";
                history.cost = cost;
            }
            resolve(history);
          }); 
        });

        } else if((driver_status == 'completed') && history.payment_method == 'CASH') {
            history.payment_status = 'completed'
            history.driver_status = 'completed'
            history.status = 'completed'
            history.date_finished = Date.now();
            history.cost = cost

        } else {
            history.driver_status = driver_status
            history.status = status
        }

        model.token.find({$or:[{user: history.user},{driver: history.driver}]}, (err, token) => {
            if (err) {
                console.log(err);
            } else {
                console.log(token.length);
                if (token.length > 0) {
                token.forEach(element => {
                    notification(element.token, `Trip ${driver_status}`, `Driver has ${driver_status} trip ${driver_status == 'completed' ? '- ₦'+ cost : ''}`, element.type);
                });
                } else {
                }
             }
        });
        // let histories = await model.history.find({driver: history.driver}, (err, histories) => {
        //     if (err) {
        //         console.log(err);
        //     } 
        //     console.log("From direct api",histories);
        //      return histories;
        // });
        // return histories;


        
        return history;
        // return history;
        
    }

    async getTripById(id) {

        let trip = await model.history.findById(id)
        
        this.trip = trip

        return trip
    }
}

module.exports = Trip