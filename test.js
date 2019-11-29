const{Visitor} =require('./db')
let item = Visitor.update(
    {Name:"Rizwan"},
    {
        where:{
            id:1
        }
    }
)