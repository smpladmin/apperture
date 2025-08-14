import pulumi
import pulumi_aws as aws

config = pulumi.Config()
data = config.require_object("data")

virtualprivatecloud = aws.ec2.Vpc(
    data.get("vpc_name"),
    cidr_block=data.get("vpc_cidr"),
    enable_dns_support=True,
    enable_dns_hostnames=True,
    tags={
        "Name": data.get("vpc_name"),
    },
)

igw = aws.ec2.InternetGateway(
    data.get("igw_name"),
    vpc_id=virtualprivatecloud.id,
    tags={
        "Name": data.get("igw_name"),
    },
)

pubroutetable = aws.ec2.RouteTable(
    data.get("pubrttable_name"),
    vpc_id=virtualprivatecloud.id,
    routes=[
        aws.ec2.RouteTableRouteArgs(
            cidr_block="0.0.0.0/0",
            gateway_id=igw.id,
        )
    ],
    tags={
        "Name": data.get("pubrttable_name"),
    },
)

publicsubnet = aws.ec2.Subnet(
    data.get("pub_subnet_name"),
    vpc_id=virtualprivatecloud.id,
    cidr_block=data.get("pub_cidr"),
    map_public_ip_on_launch=True,
    tags={
        "Name": data.get("pub_subnet_name"),
    },
)

pub_route_association = aws.ec2.RouteTableAssociation(
    data.get("pubrtasst_name"),
    route_table_id=pubroutetable.id,
    subnet_id=publicsubnet.id,
)

sg = aws.ec2.SecurityGroup(
    data.get("sec_grp_name"),
    description="Allow HTTP traffic to EC2 instance",
    ingress=[
        {
            "protocol": "tcp",
            "from_port": 80,
            "to_port": 80,
            "cidr_blocks": ["0.0.0.0/0"],
        },
        {
            "protocol": "tcp",
            "from_port": 443,
            "to_port": 443,
            "cidr_blocks": ["0.0.0.0/0"],
        },
        {
            "protocol": "tcp",
            "from_port": 22,
            "to_port": 22,
            "cidr_blocks": ["0.0.0.0/0"],
        },
        {
            "protocol": "tcp",
            "from_port": 2376,
            "to_port": 2376,
            "cidr_blocks": [data.get("pub_cidr")],
        },
        {
            "protocol": "tcp",
            "from_port": 2377,
            "to_port": 2377,
            "cidr_blocks": [data.get("pub_cidr")],
        },
        {
            "protocol": "tcp",
            "from_port": 7946,
            "to_port": 7946,
            "cidr_blocks": [data.get("pub_cidr")],
        },
        {
            "protocol": "udp",
            "from_port": 7946,
            "to_port": 7946,
            "cidr_blocks": [data.get("pub_cidr")],
        },
        {
            "protocol": "tcp",
            "from_port": 4789,
            "to_port": 4789,
            "cidr_blocks": [data.get("pub_cidr")],
        },
        {
            "protocol": "udp",
            "from_port": 4789,
            "to_port": 4789,
            "cidr_blocks": [data.get("pub_cidr")],
        },
    ],
    egress=[
        {
            "protocol": "-1",
            "from_port": 0,
            "to_port": 0,
            "cidr_blocks": ["0.0.0.0/0"],
        }
    ],
    vpc_id=virtualprivatecloud.id,
)

keypair = aws.ec2.KeyPair(
    data.get("key_name"),
    public_key=data.get("public_key"),
    tags={
        "Name": data.get("key_name"),
    },
)

ami = aws.ec2.get_ami(
    most_recent=True,
    owners=["099720109477"],
    filters=[
        aws.GetAmiFilterArgs(
            name="name",
            values=["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-20220921.1"],
        ),
        aws.GetAmiFilterArgs(name="architecture", values=["x86_64"]),
    ],
)

public_ec2_instance = aws.ec2.Instance(
    data.get("ec2_public_name"),
    instance_type=data.get("ec2_public_type"),
    vpc_security_group_ids=[sg.id],
    ami=ami.id,
    key_name=keypair.key_name,
    subnet_id=publicsubnet.id,
    root_block_device={"volume_size": 64},
    tags={
        "Name": data.get("ec2_public_name"),
        "Swarm": "manager",
    },
    iam_instance_profile="DockerSwarmManager",
)

eip = aws.ec2.Eip(
    data.get("eip_name"),
    vpc=True,
    tags={
        "Name": data.get("eip_name"),
    },
)

eip_assoc = aws.ec2.EipAssociation(
    f"{data.get('eip_name')}-{data.get('ec2_public_name')}-eip-assoc",
    instance_id=public_ec2_instance.id,
    allocation_id=eip.id,
)

for i in range(1, data.get("ec2_private_count") + 1):
    aws.ec2.Instance(
        f"{data.get('ec2_private_name')}-{i}",
        instance_type=data.get("ec2_private_type"),
        vpc_security_group_ids=[sg.id],
        ami=ami.id,
        key_name=keypair.key_name,
        subnet_id=publicsubnet.id,
        associate_public_ip_address=True,
        root_block_device={"volume_size": 100 if i == 1 else 30},
        tags={
            "Name": f"{data.get('ec2_private_name')}-{i}",
            "Swarm": f"worker-{i}",
        },
        iam_instance_profile="DockerSwarmManager",
    )

# clickhouse instance
ch_instance = aws.ec2.Instance(
    data.get("ec2_clickhouse_name"),
    instance_type=data.get("ec2_clickhouse_type"),
    vpc_security_group_ids=[sg.id],
    ami=ami.id,
    key_name=keypair.key_name,
    subnet_id=publicsubnet.id,
    associate_public_ip_address=True,
    root_block_device={"volume_size": 30},
    tags={
        "Name": data.get("ec2_clickhouse_name"),
        "Swarm": "clickhouse-worker",
    },
    iam_instance_profile="DockerSwarmManager",
)

ch_volume = aws.ebs.Volume(
    f'{data.get("ec2_clickhouse_name")}-volume',
    availability_zone=ch_instance.availability_zone,
    size=1024,
    iops=16000,
    throughput=1000,
    type="gp3",
)

aws.ec2.VolumeAttachment(
    f'{data.get("ec2_clickhouse_name")}-volume-att',
    device_name="/dev/sdh",
    volume_id=ch_volume.id,
    instance_id=ch_instance.id,
)

# jupyter instance
if data.get("ec2_jupyter_name"):
    jpy_instance = aws.ec2.Instance(
        data.get("ec2_jupyter_name"),
        instance_type=data.get("ec2_jupyter_type"),
        vpc_security_group_ids=[sg.id],
        ami=ami.id,
        key_name=keypair.key_name,
        subnet_id=publicsubnet.id,
        associate_public_ip_address=True,
        root_block_device={"volume_size": 200},
        tags={
            "Name": data.get("ec2_jupyter_name"),
            "Swarm": "jupyter-worker",
        },
        iam_instance_profile="DockerSwarmManager",
    )
pulumi.export("manager_public_ip", eip.public_ip)
