import mongoose, { Schema } from "mongoose";   // Import mongoose library and Schema class for creating database schemas

// Define the schema structure for subscriptions in the database (i.e., user subscribing to another user)
const subscriptionSchema = new Schema({
    subscriber: {   // Field to store the ID of the user who is subscribing to someone else
        type: Schema.Types.ObjectId,   // MongoDB ObjectId referencing another document
        ref: 'User'   // Reference to the User model - this creates a relationship between Subscription and User collections
    },
    channel: {   // Field to store the ID of the user/channel being subscribed to (the channel/creator being followed)
        type: Schema.Types.ObjectId,   // MongoDB ObjectId type for referencing other documents
        ref: 'User'   // Reference to the User model - the channel is also a User in this case
    }
    
}, { timestamps: true })


// Create and export the Subscription model using the schema
// This model can be used to create, read, update, and delete subscription records in the database
export const Subscription = mongoose.model('Subscription', subscriptionSchema)


// +++++++++++++++++++ NOTES: +++++++++++++++++++++++++++++++++

// Every time a user subscribes a channel, a new document will be created
/* Document eg:-
{
    subscriber: 'a',
    channel: 'chai aur code'
}
*/
// If we wanna know the total no of subscribers of a particular channel, then we select the channel and count all the documents containing that channel
// If we wanna know the total no of channels a particular user has subscribed to, then we select the subscriber and count all the documents containing that subscriber