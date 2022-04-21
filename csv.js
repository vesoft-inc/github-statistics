const ObjectToCsv = require('objects-to-csv');
const axios = require('axios');

const token = 'token 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' // Enter your Github token

const repos = [
    {
        'url': 'vesoft-inc/nebula', // repo github url
        'name': 'nebula'
    },
    {
        'url': 'esoft-inc/github-statistics',
        'name': 'github-statistics'
    },
];

let csv_datas = [];
(async () => {
    let data_item = {};
    await Promise.all(
        repos.map(async _repo =>{
            try {
                const { data } = await axios.get(`https://api.github.com/repos/${_repo.url}`, {
                    headers: {
                        "Authorization": token
                    }
                });
                // console.log("data",data)
                // commit
                const {  headers:commit } = await axios.get(`https://api.github.com/repos/${data.full_name}/commits?per_page=1&page=1`, {
                    headers: {
                        "Authorization": token
                    }
                });
            
                // issue
            
                const { headers: issue } = await axios.get(`https://api.github.com/repos/${data.full_name}/issues?state=closed&per_page=1&page=1`, {
                    headers: {
                        "Authorization": token
                    }
                });
            
                // pull request count
            
                const {headers:pr_count_1} = await axios.get(`https://api.github.com/repos/${data.full_name}/pulls?state=open&per_page=1&page=1`, {
                    headers: {
                        "Authorization": token
                    }
                });
                const {headers:pr_count_2} = await axios.get(`https://api.github.com/repos/${data.full_name}/pulls?state=closed&per_page=1&page=1`, {
                    headers: {
                        "Authorization": token
                    }
                });
            
                data_item.repo_name = data.full_name.split("/")[0];
                data_item.date = data.created_at.slice(0, 10);
                data_item.fork_count = data.forks_count;
                data_item.star_count = data.stargazers_count;
                data_item.issue_count = issue.link.split(',')[1].split("page=")[2].split(">")[0] + data.open_issues_count;
                data_item.pr_count = Number(pr_count_1.link.split(',')[1].split("page=")[2].split(">")[0] ) + Number(pr_count_2.link.split(',')[1].split("page=")[2].split(">")[0]);
                data_item.commit_count = commit.link.split('page=')[4].split(">")[0];
                csv_datas = [...csv_datas, { ...data_item }];
            } catch (error) {
                console.log('error:', error)
            }
        })
    )


    const csv = new ObjectToCsv(csv_datas);
    // save to file

    await csv.toDisk('./repo_data.csv');

    // csv has exported

    console.log('csv has exported');
    
})();