const Job = require('../models/Job');
const job = require('../models/Job');

exports.getJobs = async (req,res) =>{
    try{
        const jobs = await Job.find({user:req.user.id}).sort({createdAt: -1});
        res.json(jobs);

    }catch (err) { res.status(500).json({message: err.message});}
};

exports.createJob = async  (req,res)=> {
    try{
        const job = await Job.create({...req.body, user:req.user.id});
        res.status(201).json(job);

    }catch(err) {res.status(500).json({message: err.messge});}
};

exports.updateJob = async (req,res)=>{
    try{
        const job = await Job.findOneAndUpdate(
            {_id:req.params.id,user:req.user.id},
            req.body,{new:true}
        );
        if(!job) return res.status(404).json({message: 'Not found'});
        res.json(job);
    }catch(err) {res.status(500).json({message: err.message});}
};

exports.deleteJob = async (req,res)=>{
    try{
        await Job.findOneAndDelete({_id:req.params.id,user:req.user.id});
        res.json({message: 'Deleted'});
    }catch(err){res.status(500).json({message:err.message});}
};